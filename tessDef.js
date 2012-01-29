/* Encapsulation of the definitions of a tessellation.
 * not what is drawn in the tessellation, but the repeating characteristics
 * of the tessellation itself.
 * 
 * Language:
 *  Poly = triangle, square, hexagon, other polygon
 *  PolyGroup = {Poly+}, {PolyGroup:X*Lattice?}
 *  CopyOp = :
 *  Rotation = R(degrees)
 *  Translation = T(vector)
 *  Lattice = L(vector, vector)
 *  X (transform) = Rotation, Translation
 */
var $, paper; // declarations for jslint

var initTessDef = (function() {
	
	var tessDef = {};
	
	// PolyGroup represents a set of polygons or a PolyGroup with transformations applied
	var PolyGroup = {
		polygons: null,
		// a nested polygon group that will be transformed by this PG's transforms or lattice
		subgroups: null,
		transforms: null,
		lattice: null,
		latticePoints: null,
		symbols: null,
		group: null,
		symbol: null,
		//symbols: [], // one per polygon
		//groups: [], // one per copy of the inner polygroup
		// TODO ?
		toString: function() { return this.polygons.toString() + /*this.polygroup.toString() + */this.transforms.toString(); },
		addPolygon: function(polygon) {
			// add to list
			this.polygons.push(polygon);
		},
		addSubgroup: function(group) {
			group.parent = this;
			this.subgroups.push(group);
		},
		addTransform: function(transform) {
			// TODO remove lattice to enforce mutual exclusivity?
			this.transforms.push(transform);
		},
		addLattice: function(lattice) {
			// TODO remove transforms to enforce mutual exclusivity?
			this.lattice = lattice;
		},
		onResize: function(view) {
			// TODO if lattice exists
			this.recomputeLattice(view);
		},
		// TODO debugging method to add label on a lattice placement
		addLabel: function(point, content) {
			var label = new paper.PointText(point);
			label.content = content;
			label.paragraphStyle.justification = 'center';
			label.strokeColor = 'blue';
			return label;
		},
		setRenderHead: function(head) {
			// pass command up to root
			if(this.parent) {
				this.parent.setRenderHead(head);
				return;
			}

			if(this.undo) {
				this.undo();
				this.undo = null;
			}

			// TODO lattice existence assumption
			// if head is not lattice, hide lattice group
			if(head !== null && head !== this.lattice) {
				this.latticeGroup.visible = false;
			}

			// null indicates draw full tessellation
			if(head === null) {
				this.latticeGroup.visible = true;
			}
			// if head is this polygroup (stamp), place one instance of the outer group
			if(head === this) {
				// TODO which layer?
				this.currentRender = new paper.Group();
				this.currentRender.addChild(this.symbol.place());
				// TODO we should probably just add the existing group to a layer to make it visible
				// TODO it would make interaction easier too probably
				this.undo = function() {
					this.currentRender.remove();
				}
			}
			// if head is the lattice, make it visible
			if(head === this.lattice) {
				// make lattice group visible
				this.latticeGroup.visible = true;
				// TODO show lattice arrows
			}
			// if head is the set of polygons
			if(head === this.polygons) {
				this.currentRender = new paper.Group();
				this.currentRender.addChild(this.symbol.place());
				// color code the polygons
				// TODO color code better than random
				// TODO color code html elements
				$.each(this.polygons, function(index, polygon) {
					polygon.strokeColor = new paper.RgbColor(Math.random(), Math.random(), Math.random());
				});
				// define function to undo changes
				this.undo = function() {
					$.each(this.polygons, function(index, polygon) {
						// TODO magic constant
						polygon.strokeColor = '#ddd';
					});
					this.currentRender.remove();
				}
			}
			// if head is a single local polygon
			if($.inArray(head, this.polygons) >= 0) {
				var parent = head.parent;
				// define function to undo changes
				this.undo = function() {
					parent.addChild(head);
				}
				paper.project.activeLayer.addChild(head);
			}
		},
		recomputeLattice: function(view) {
			// TODO there is probably a better way to do this

			if(this.lattice) {

				var that = this;
				var lastPlacement = this.placement;
				
				// get lattice points in rectangle
				rect = view.bounds;
				// get lattice point closest to middle of rect
				var closest = this.lattice.closestTo(rect.center);
				// search for lattice points where symbol placement would be visible
				var toCheck = [closest.coefs];
				// TODO need to get symbol from group without lattice
				var newPlacement = this.searchVisibleLattice(toCheck, this.symbol, rect, null);
				// TODO debugging empty placement problem
				if(newPlacement.visible.length === 0) {
					console.log("something went very wrong");
					closest = this.lattice.closestTo(rect.center);
				}

				// compare new placment and old placement
				// draw at locations in new placement but not in old
				// remove locations in old but not in new
				$.each(newPlacement.checked, function(coef, visible) {
					if(visible) {
						if(!lastPlacement.checked[coef]) {
							// new point visible, place and add to lattice group
							that.latticeGroup.addChild(that.symbol.place(that.lattice.getPoint(visible)));
							// name child
							that.latticeGroup.lastChild.name = coef;
							// also place content symbol and set as sister of original
							that.latticeGroup.lastChild.sister = that.symbol.sister.place(that.lattice.getPoint(visible));
						}
					}
				});
				$.each(lastPlacement.checked, function(coef, visible) {
					if(visible) {
						if(!newPlacement.checked[coef]) {
							// also remove content symbol
							that.latticeGroup.children[coef].sister.remove();
							// newly not-visible point: remove
							that.latticeGroup.children[coef].remove();
						}
					}
				});
				this.placement = newPlacement;
			}
		},
		onLatticeChange: function(view) {
			var that = this;
			// remove all placements
			$.each(this.placement.checked, function(coef, visible) {
				if(visible) {
					that.latticeGroup.children[coef].remove();
				}
			});
			// redo lattice placement
			if(this.latticeGroup) {
				this.latticeGroup.remove();
			}
			this.doInitialLatticePlacement(view);
			view.draw();
		},
		doInitialLatticePlacement: function(view) {
			var symbol = this.symbol;
			// create a group for the lattice which will become the outer group
			var latticeGroup = new paper.Group();
			
			// get lattice points in rectangle
			var rect = view.bounds;
			// get lattice point closest to middle of rectangle
			var closest = this.lattice.closestTo(rect.center);
			// search for lattice points where symbol placement would be visible
			var toCheck = [closest.coefs];
			var placement = this.searchVisibleLattice(toCheck, symbol, rect, latticeGroup);
			this.latticePoints = placement.visible;
			
			// place symbols at the visible points
			//$.each(this.latticePoints, function(index, point) {
				// TODO set child's name based on the coef values so that we can remove it later
				//latticeGroup.addChild(symbol.place(point));
			//});
			// TODO replacing above loop with loop over coefs so that we can store name
			var that = this;
			$.each(placement.checked, function(coef, visible) {
				if(visible) {

					latticeGroup.addChild(symbol.place(that.lattice.getPoint(visible)));
					// name child
					latticeGroup.lastChild.name = coef;
					//console.log('name label: ' + latticeGroup.children[coef].label);

					// also place an instance of the sister symbol and set as sister of original placement
					paper.project.layers[1].addChild(symbol.sister.place(that.lattice.getPoint(visible)));
					latticeGroup.lastChild.sister = paper.project.layers[1].lastChild;
				}
			});
			
			// update the outer group to be the lattice group
			var outerGroup = latticeGroup;
			// create symbol for entire thing
			//var latticeSymbol = outerGroup.symbolize();
			// store group and symbol on this
			// TODO this is clobbered in render
			this.latticeGroup = outerGroup;
			///this.latticeSymbol = latticeSymbol;
			// finally, place entire symbol
			//this.latticeSymbol.place();
			
			// store placement info for resizing
			this.placement = placement;
		},
		// return {'visible': the list of lattice locations where the placed symbol bounds intersect the supplied rectangle,
		//			'checked': an object with an attribute for every coefficient pair that was checked. the value is true iff
		//						the symbol placement at the corresponding location is visible }
		searchVisibleLattice: function(toCheck, symbol, rectangle, group) {
			// create a symbol placement to test with
			var placement = symbol.place();
			// visible is the master list of actual project coordinate locations of visible lattice points
			var visible = [];
			// checked has an attribute for every lattice coefficient pair that has been searched
			var checked = {};
			var coefs;
			// addNeighbors is a function for adding neighbors to the search queue
			var addNeighbors = function(index, neighbor) {
				// produce the actual coefficients
				var newPoint = neighbor.add(coefs);
				if(!checked.hasOwnProperty(newPoint.toString())) {
					// if not yet checked, add to search queue
					toCheck.push(newPoint);
					// mark as checked so it won't be added again
					// the actual truth value will be set when it is examined
					checked[newPoint.toString()] = false;
				}
			};
			while(toCheck.length > 0) {
				// search at the first point in toCheck
				coefs = toCheck.shift();
				// get lattice point
				var location = this.lattice.getPoint(coefs);
				// set translation of placement
				// TODO this could possible be imprecise
				placement.translate(location);
				// test if placement intersects rectangle
				if(placement.bounds.intersects(rectangle)) {
					// if so, mark as visible
					visible.push(location);
					// put in checked object
					checked[coefs.toString()] = coefs;
					// add neighbors to search queue
					var neighbors = [
						new paper.Point(-1,-1), new paper.Point(0,-1), new paper.Point(1,-1),
						new paper.Point(-1, 0),						new paper.Point(1, 0),
						new paper.Point(-1, 1), new paper.Point(0, 1), new paper.Point(1, 1)
					];
					$.each(neighbors, addNeighbors);
				} else {
					// set value in checked object
					checked[coefs.toString()] = false;
				}
				// undo placement translation
				placement.translate(location.negate());
			}
			
			// remove test placement
			placement.remove();
			
			return {'visible': visible, 'checked': checked};
			
		},
		// render in a view
		render: function(view) {
			// if the symbol for this group is already defined, return it
			if(this.symbol) {
				return this.symbol;
			}
			
			// reduce the lattice basis if there is a lattice
			if(this.lattice && !this.lattice.isReduced()) {
				this.lattice.reduceBasis();
			}
			
			// get the group with the subgroups and local symbol placements
			var innerSymbol = this.getInnerGroup(view);
			
			// place inner symbol into main polygroup group
			//var outerGroup = new paper.Group([innerSymbol.place()]);
			var outerGroup = new paper.Group();

			// group for holding the placements of the sister symbol
			var sisterGroup = new paper.Group([innerSymbol.sister.place()]);

			var that = this;
			
			// if PG has transforms, make a copy of inner group for each and apply transform
			if(this.transforms.length > 0) {
				
				// parse transforms and apply operations
				$.each(this.transforms, function(index, transform) {
					
					// add transformed placed inner symbol into group 
					outerGroup.addChild(innerSymbol.place().transform(transform));

					// add transformed placed inner symbol sister into sister group
					sisterGroup.addChild(innerSymbol.sister.place().transform(transform));
				});
			}
			
			// make symbol from outer group
			var outerSymbol = outerGroup.symbolize();

			this.symbol = outerSymbol;

			// make symbol for sister group
			outerSymbol.sister = sisterGroup.symbolize();
			
			// if there is a lattice defined, copy this group to each point
			if(this.lattice) {
				// place symbols at visible lattice points
				this.doInitialLatticePlacement(view);
				
			} else {
				// if there is no lattice, place one instance of the symbol for this group
				if(!this.parent) {
					outerSymbol.place();
					// also place one instance of the sister symbol
					outerSymbol.sister.place();
				}
			}
			
			// store group and symbol on this
			this.group = outerGroup;
			this.symbol = outerSymbol;

			return this.symbol;
		},
		getInnerGroup: function(view) {
			
			// get inner groups from subgroups
			var innerGroups = [];
			$.each(this.subgroups, function(index, group) {
				// get subgroup symbol
				var symbol = group.render(view);
				// place symbol and put into group
				innerGroups.push(symbol.place());
			});

			// create inner group
			var group = new paper.Group(innerGroups.concat(this.polygons));
			// make symbol from group
			var symbol = group.symbolize();

			// create a group & symbol for paths drawn into this group's polygons
			var sisterInner = innerGroups.map(function(group) { return group.sister; })
			group.sister = (sisterInner.length > 0) ? new paper.Group(sisterInner) : new paper.Group();
			symbol.sister = group.sister.symbolize();

			// return symbol
			return symbol;
		},
		addPath: function(path,layer) {
			
			// find polygon the new path hits
			var hitInfo = this.findPolygonAt(path.firstSegment.point);
			
			if(hitInfo) {
				// create a symbol of the path
				// save original position before creating symbol
				var symbol = path.symbolize();
				// add the path back to active layer
				paper.project.activeLayer.addChild(path);
				// add path to the group where the matching polygon is
				hitInfo.polygon.parent.sister.addChild(symbol.place().transform(hitInfo.transform.createInverse()));
				// make path selected
				path.selected = true;
			}
		},
		findPolygonAt: function(point) {
			return this.hitPolygons(point);
		},
		hitPolygons: function(point) {
			var that = this;
			
			var hit = false;
			var hitInfo = null;
			
			if(this.latticePoints.length > 0) {
				$.each(this.latticePoints, function(index, latticePoint) {
					// translate by -latticePoint to search within this portion of the lattice
					var curPoint = point.subtract(latticePoint);
					
					// check this groups for hits at the lattice point adjusted point
					hitInfo = that.hitPolygonGlobal(curPoint);
					
					// if hit, return from latticePoint loop after
					// updating transform with the lattice translation
					if(hitInfo) {
						hit = true;
						// pre translate by lattice point
						hitInfo.transform.preConcatenate(paper.Matrix.getTranslateInstance(latticePoint.x, latticePoint.y));
						return false;
					}
				});
			} else {
				// if no lattice, just do test at given point
				hitInfo = that.hitPolygonGlobal(point);
			}
			
			return hitInfo;
		},
		// hitPolygon helper function:
		// check for hits in this group at a supplied global point
		hitPolygonGlobal: function(point) {
			var that = this;
			
			// check local polygons and subgroups with no transforms applied
			var hitInfo = that.hitPolygonLocal(point);
			// if hit, return. don't need to update transform because none was applied here
			if(hitInfo) {
				return hitInfo;
			}
			
			var hit = false;
			
			// perform reverse transforms to check local polygons and subgroups
			$.each(this.transforms, function(index, transform) {
				var localPoint = transform.inverseTransform(point);
				
				// do local checks
				hitInfo = that.hitPolygonLocal(localPoint);
				// if hit, update transformation with local transform and return
				if(hitInfo) {
					hit = true;
					hitInfo.transform.preConcatenate(transform);
					return false;
				}
			});
			
			// if we found a hit, return the hit polygon
			if(hit) {
				return hitInfo;
			}
		},
		// hitPolygon helper function:
		// check local polygons and subgroups for hits at a point in local coords
		// TODO local is actually sublocal because a transformation (maybe identity) has been applied
		// TODO the solution is to not have transforms in a group applied to polygons in the group
		hitPolygonLocal: function(point) {
			var hit = false;
			var hitInfo = null;
			
			// check against local polygons
			$.each(this.polygons, function(index, polygon) {
				if(polygon.contains(point)) {
					hit = true;
					hitInfo = {
						polygon: polygon,
						transform: new paper.Matrix()
					};
					return false;
				}
			});
			
			// if we hit a local polygon, return
			if(hit) {
				return hitInfo;
			}
			
			// if no local polygon hits, recurse into subgroups
			$.each(this.subgroups, function(index, subgroup) {
				var subHitInfo = subgroup.hitPolygons(point);
				if(subHitInfo) {
					hit = true;
					hitInfo = subHitInfo;
					return false;
				}
			});
			
			return hitInfo;
		}
	};
	var CreatePolyGroup = function() {
		var newPolyGroup = Object.create(PolyGroup);
		newPolyGroup.polygons = [];
		newPolyGroup.transforms = [];
		newPolyGroup.symbols = [];
		newPolyGroup.subgroups = [];
		newPolyGroup.group = null;//new paper.Group();
		newPolyGroup.latticePoints = [];
		return newPolyGroup;
	};

	// Lattice represents an operator which places a polygon or group at every point in a lattice defined by two vectors
	var Lattice = {
		v1: new paper.Point(),
		v2: new paper.Point(),
		m: new paper.Matrix(),
		toString: function() { return "L(" + this.v1.toString() + "," + this.v2.toString() + ")"; },
		LatticeBy: function(vec1, vec2) {
			var lattice = Object.create(Lattice);
			lattice.v1 = vec1;
			lattice.v2 = vec2;
			// TODO reduce on construct?
			// create matrix on construct
			lattice.computeMatrix();
			return lattice;
		},
		reduceBasis: function() {
			if(this.isReduced()) {
				return;
			}

			// basically Euclid's GCD algorithm for vectors
			// from mit open courseware stuff
			// http://ocw.mit.edu/courses/mathematics/18-409-topics-in-theoretical-computer-science-an-algorithmists-toolkit-fall-2009/lecture-notes/MIT18_409F09_scribe19.pdf
			var v1length = this.v1.length;
			var v2length = this.v2.length;
			var v;
			
			if(v2length < v1length) {
				v = this.v2;
				this.v2 = this.v1;
				this.v1 = v;
				v = v2length;
				v2length = v1length;
				v1length = v;
			}
			
			while(!this.isReduced()) {
				// find m to minimize v2 - m*v1
				// TODO i think this is probably not correct
				//var m = Math.floor(v2length / v1length);
				// TODO this is right, but probably really slow
				var m = 0;
				var lastLength = this.v2.length;
				var newlength
				while((newlength = this.v2.subtract(this.v1.multiply(m+1)).length) < lastLength) {
					m = m + 1;
					lastLength = newlength;
				}
				// set v2 = v2 - m*v1
				this.v2 = this.v2.subtract(this.v1.multiply(m));
				// update length
				v2length = this.v2.length;
				// if |v2| <= |v1|, then done
				if(v1length < v2length) {
					break;
				}
				// swap v1 and v2
				v = this.v2;
				this.v2 = this.v1;
				this.v1 = v;
				v = v2length;
				v2length = v1length;
				v1length = v;
			}

			// recompute trasnformation matrix
			this.computeMatrix();
		},
		computeMatrix: function() {
			// generate transformation matrix between lattice space and project space
			this.m = new paper.Matrix(this.v1.x, this.v1.y, this.v2.x, this.v2.y, 0,0);
		},
		isReduced: function() {
			return 2 * Math.abs(this.v1.dot(this.v2)) <= this.v1.getDistance(new paper.Point(), true);
		},
		draw: function(range, color) {
			var circle = new paper.Path.Circle([0,0], 2);
			circle.fillColor = color || 'green';
			var symbol = new paper.Symbol(circle);
			for(var i = range.i[0]; i < range.i[1]; i++) {
				for(var j = range.j[0]; j < range.j[1]; j++) {
					symbol.place(this.v1.multiply(i).add(this.v2.multiply(j)));
				}
			}
		},
		getPoint: function(coefs) {
			//return this.v1.multiply(coefs.x).add(this.v2.multiply(coefs.y));
			return this.m.transform(coefs);
		},
		decompose: function(point,slow) {
			// good method with matrix
			var mcoef = this.m.inverseTransform(point);
			return mcoef;
		},
		closestTo: function(point, slow) {
			var coefs = this.decompose(point, slow);
			var closestCoefs = coefs.round();
			var location = this.getPoint(closestCoefs);
			return {point: location, coefs: closestCoefs};
		},
	};
	
	var SquarePoly = new paper.Path.Rectangle([0,0],[100,100]);
	SquarePoly.strokeColor = '#ddd';
	SquarePoly.strokeWidth = 3;
	SquarePoly.remove();

	var innerGroup44 = CreatePolyGroup();//Object.create(PolyGroup);
	innerGroup44.addPolygon(SquarePoly);
	innerGroup44.addTransform(new paper.Matrix());
	var PolyGroup44 = CreatePolyGroup();//Object.create(PolyGroup);
	PolyGroup44.addLattice(Lattice.LatticeBy(new paper.Point([0,100]), new paper.Point([100,0])));
	PolyGroup44.addSubgroup(innerGroup44);
	PolyGroup44.addTransform(new paper.Matrix());
	
	var TrianglePoly = new paper.Path.RegularPolygon([50,50], 3, 50);
	TrianglePoly.strokeColor = '#ddd';
	TrianglePoly.strokeWidth = 3;
	TrianglePoly.remove();

	/*var innerGroupHex = CreatePolyGroup();
	innerGroupHex.addPolygon(TrianglePoly.clone());
	var rotGroupHex = CreatePolyGroup();
	//rotGroupHex.addTransform(Rotation.rotBy(60, TrianglePoly.firstSegment.point));
	rotGroupHex.addTransform(new paper.Matrix().rotate(60, TrianglePoly.firstSegment.point));
	rotGroupHex.addSubgroup(innerGroupHex);
	var latGroupHex = CreatePolyGroup();
	latGroupHex.addLattice(Lattice.LatticeBy(TrianglePoly.segments[1].point.subtract(TrianglePoly.segments[0].point),
											TrianglePoly.segments[2].point.subtract(TrianglePoly.segments[1].point)));
	latGroupHex.addSubgroup(rotGroupHex);*/
	
	// new formulation in a single group
	var latGroupHex = CreatePolyGroup();
	latGroupHex.addPolygon(TrianglePoly);
	latGroupHex.addTransform(new paper.Matrix());
	latGroupHex.addTransform(new paper.Matrix().rotate(60, TrianglePoly.firstSegment.point));
	// TODO testing
	//for(var i = 10; i < 90; i+=10) {
	//	latGroupHex.addTransform(Rotation.rotBy(i));
	//}
	latGroupHex.addLattice(Lattice.LatticeBy(TrianglePoly.segments[1].point.subtract(TrianglePoly.segments[0].point),
											TrianglePoly.segments[2].point.subtract(TrianglePoly.segments[1].point)));
											
	var hitTestGroup = CreatePolyGroup();
	hitTestGroup.addPolygon(TrianglePoly);
	// TODO write group with transforms so we can test hitPolygons
	hitTestGroup.addTransform(new paper.Matrix());
	hitTestGroup.addTransform(new paper.Matrix().rotate(60, TrianglePoly.firstSegment.point));
	hitTestGroup.addTransform(new paper.Matrix().rotate(120, TrianglePoly.firstSegment.point));
	hitTestGroup.addTransform(new paper.Matrix().rotate(180, TrianglePoly.firstSegment.point));

	// tessellation for wedding hearts
	var heartGroup = CreatePolyGroup();

	heartGroup.addPolygon(SquarePoly);
	heartGroup.addTransform(new paper.Matrix().scale(1,-1, SquarePoly.position)
												//.rotate(180, SquarePoly.position)
												.translate(SquarePoly.bounds.width, 0)
											);
	heartGroup.addLattice(Lattice.LatticeBy(new paper.Point(SquarePoly.bounds.width * 2,0),
											new paper.Point(SquarePoly.bounds.width*0.5,SquarePoly.bounds.height)));

	log.log('heart lattice is reduced: ' + heartGroup.lattice.isReduced());

	var rectangle = new paper.Path.Rectangle([0,0], [50,100]);
	rectangle.strokeColor = "#ddd";
	rectangle.remove();
	var kcGroup = CreatePolyGroup();
	kcGroup.addPolygon(rectangle);
	kcGroup.addTransform(new paper.Matrix());
	kcGroup.addTransform(new paper.Matrix()
									.rotate(90, new paper.Point(rectangle.bounds.right, rectangle.bounds.bottom))
						);
	kcGroup.addTransform(new paper.Matrix()
									.rotate(180, new paper.Point(rectangle.bounds.right, rectangle.bounds.bottom))
						);
	kcGroup.addTransform(new paper.Matrix()
									.rotate(270, new paper.Point(rectangle.bounds.right, rectangle.bounds.bottom))
						);
	kcGroup.addLattice(Lattice.LatticeBy(new paper.Point(150, 0),
										new paper.Point(0,150)));
	/*kcGroup.addLattice(Lattice.LatticeBy(new paper.Point(0,100),
										new paper.Point(50,50)));*/
	
	$.extend(tessDef, {
		//Poly: Poly,
		PolyGroup: PolyGroup,
		Lattice: Lattice,
		PolyGroup44: PolyGroup44,
		//GroupHex: rotGroupHex
		GroupHex: latGroupHex,
		HitGroup: hitTestGroup,
		HeartGroup: heartGroup,
		kcGroup: kcGroup
	});
	
	return tessDef;
});
