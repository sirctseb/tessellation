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

//var initTessDef = (function() {
var tessellationModel = function(spec, my) {
	
	var that,
		polygons = [],
		subgroups = [],
		transforms = [],
		lattice = [],
		latticePoints = [],
		group = null,
		symbol = null,
		latticeGroup = null;

	my = my || {};
	that = {};

	// TODO ?
	var toString = function() { return polygons.toString() + /*this.polygroup.toString() + */transforms.toString(); };
	var addPolygon = function(polygon) {
		// add to list
		polygons.push(polygon);
	};
	var addSubgroup = function(group) {
		group.parent = that;
		subgroups.push(group);
	};
	var addTransform = function(transform) {
		// TODO remove lattice to enforce mutual exclusivity?
		transforms.push(transform);
	};
	var addLattice = function(lattice_in) {
		// TODO remove transforms to enforce mutual exclusivity?
		lattice = lattice_in;
	};
	var onResize = function(view) {
		// TODO if lattice exists
		recomputeLattice(view);
	};
	// TODO debugging method to add label on a lattice placement
	var addLabel = function(point, content) {
		var label = new paper.PointText(point);
		label.content = content;
		label.paragraphStyle.justification = 'center';
		label.strokeColor = 'blue';
		return label;
	};
	var setRenderHead = function(head) {
		// pass command up to root
		if(my.parent) {
			my.parent.setRenderHead(head);
			return;
		}

		if(my.undo) {
			my.undo();
			my.undo = null;
		}

		// TODO lattice existence assumption
		// if head is not lattice, hide lattice group
		if(head !== null && head !== lattice) {
			latticeGroup.visible = false;
		}

		// null indicates draw full tessellation
		if(head === null) {
			latticeGroup.visible = true;
		}
		// if head is this polygroup (stamp), place one instance of the outer group
		if(head === that) {
			// TODO which layer?
			my.currentRender = new paper.Group();
			my.currentRender.addChild(symbol.place());
			// TODO we should probably just add the existing group to a layer to make it visible
			// TODO it would make interaction easier too probably
			my.undo = function() {
				my.currentRender.remove();
			}
		}
		// if head is the lattice, make it visible
		if(head === lattice) {
			// make lattice group visible
			latticeGroup.visible = true;
			// TODO show lattice arrows
		}
		// if head is the set of polygons
		if(head === polygons) {
			my.currentRender = new paper.Group();
			my.currentRender.addChild(symbol.place());
			// color code the polygons
			// TODO color code better than random
			// TODO color code html elements
			$.each(polygons, function(index, polygon) {
				polygon.strokeColor = new paper.RgbColor(Math.random(), Math.random(), Math.random());
			});
			// define function to undo changes
			my.undo = function() {
				$.each(polygons, function(index, polygon) {
					// TODO magic constant
					polygon.strokeColor = '#ddd';
				});
				my.currentRender.remove();
			}
		}
		// if head is a single local polygon
		if($.inArray(head, polygons) >= 0) {
			var parent = head.parent;
			// define function to undo changes
			my.undo = function() {
				parent.addChild(head);
			}
			paper.project.activeLayer.addChild(head);
		}
	};
	var recomputeLattice = function(view) {
		// TODO there is probably a better way to do this

		if(lattice) {

			//var that = this;
			var lastPlacement = my.placement;
			
			// get lattice points in rectangle
			rect = view.bounds;
			// get lattice point closest to middle of rect
			var closest = lattice.closestTo(rect.center);
			// search for lattice points where symbol placement would be visible
			var toCheck = [closest.coefs];
			// TODO need to get symbol from group without lattice
			var newPlacement = searchVisibleLattice(toCheck, symbol, rect, null);
			// TODO debugging empty placement problem
			if(newPlacement.visible.length === 0) {
				console.log("something went very wrong");
				closest = lattice.closestTo(rect.center);
			}

			// compare new placment and old placement
			// draw at locations in new placement but not in old
			// remove locations in old but not in new
			$.each(newPlacement.checked, function(coef, visible) {
				if(visible) {
					if(!lastPlacement.checked[coef]) {
						// new point visible, place and add to lattice group
						latticeGroup.addChild(symbol.place(lattice.getPoint(visible)));
						// name child
						latticeGroup.lastChild.name = coef;
						// also place content symbol and set as sister of original
						latticeGroup.lastChild.sister = symbol.sister.place(lattice.getPoint(visible));
					}
				}
			});
			$.each(lastPlacement.checked, function(coef, visible) {
				if(visible) {
					if(!newPlacement.checked[coef]) {
						// also remove content symbol
						latticeGroup.children[coef].sister.remove();
						// newly not-visible point: remove
						latticeGroup.children[coef].remove();
					}
				}
			});
			my.placement = newPlacement;
		}
	};
	var onLatticeChange = function(view) {
		//var that = this;
		// remove all placements
		$.each(my.placement.checked, function(coef, visible) {
			if(visible) {
				latticeGroup.children[coef].remove();
			}
		});
		// redo lattice placement
		if(latticeGroup) {
			latticeGroup.remove();
		}
		doInitialLatticePlacement(view);
		view.draw();
	};
	var doInitialLatticePlacement = function(view) {
		//var symbol = symbol;
		// create a group for the lattice which will become the outer group
		latticeGroup = new paper.Group();
		
		// get lattice points in rectangle
		var rect = view.bounds;
		// get lattice point closest to middle of rectangle
		var closest = lattice.closestTo(rect.center);
		// search for lattice points where symbol placement would be visible
		var toCheck = [closest.coefs];
		var placement = searchVisibleLattice(toCheck, symbol, rect, latticeGroup);
		my.latticePoints = placement.visible;
		
		// place symbols at the visible points
		//$.each(this.latticePoints, function(index, point) {
			// TODO set child's name based on the coef values so that we can remove it later
			//latticeGroup.addChild(symbol.place(point));
		//});
		// TODO replacing above loop with loop over coefs so that we can store name
		//var that = this;
		$.each(placement.checked, function(coef, visible) {
			if(visible) {

				latticeGroup.addChild(symbol.place(lattice.getPoint(visible)));
				// name child
				latticeGroup.lastChild.name = coef;
				//console.log('name label: ' + latticeGroup.children[coef].label);

				// also place an instance of the sister symbol and set as sister of original placement
				paper.project.layers[1].addChild(symbol.sister.place(lattice.getPoint(visible)));
				latticeGroup.lastChild.sister = paper.project.layers[1].lastChild;
			}
		});
		
		// update the outer group to be the lattice group
		var outerGroup = latticeGroup;
		// create symbol for entire thing
		//var latticeSymbol = outerGroup.symbolize();
		// store group and symbol on this
		// TODO this is clobbered in render
		latticeGroup = outerGroup;
		///this.latticeSymbol = latticeSymbol;
		// finally, place entire symbol
		//this.latticeSymbol.place();
		
		// store placement info for resizing
		my.placement = placement;
	};
	// return {'visible': the list of lattice locations where the placed symbol bounds intersect the supplied rectangle,
	//			'checked': an object with an attribute for every coefficient pair that was checked. the value is true iff
	//						the symbol placement at the corresponding location is visible }
	var searchVisibleLattice = function(toCheck, symbol, rectangle, group) {
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
			var location = lattice.getPoint(coefs);
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
		
	};
	// render in a view
	var render = function(view) {
		// if the symbol for this group is already defined, return it
		if(symbol) {
			return symbol;
		}
		
		// reduce the lattice basis if there is a lattice
		if(lattice && !lattice.isReduced()) {
			lattice.reduceBasis();
		}
		
		// get the group with the subgroups and local symbol placements
		var innerSymbol = getInnerGroup(view);
		
		// place inner symbol into main polygroup group
		//var outerGroup = new paper.Group([innerSymbol.place()]);
		var outerGroup = new paper.Group();

		// group for holding the placements of the sister symbol
		var sisterGroup = new paper.Group([innerSymbol.sister.place()]);

		//var that = this;
		
		// if PG has transforms, make a copy of inner group for each and apply transform
		if(transforms.length > 0) {
			
			// parse transforms and apply operations
			$.each(transforms, function(index, transform) {
				
				// add transformed placed inner symbol into group 
				outerGroup.addChild(innerSymbol.place().transform(transform));

				// add transformed placed inner symbol sister into sister group
				sisterGroup.addChild(innerSymbol.sister.place().transform(transform));
			});
		}
		
		// make symbol from outer group
		var outerSymbol = outerGroup.symbolize();

		symbol = outerSymbol;

		// make symbol for sister group
		outerSymbol.sister = sisterGroup.symbolize();
		
		// if there is a lattice defined, copy this group to each point
		if(lattice) {
			// place symbols at visible lattice points
			doInitialLatticePlacement(view);
			
		} else {
			// if there is no lattice, place one instance of the symbol for this group
			if(!parent) {
				outerSymbol.place();
				// also place one instance of the sister symbol
				outerSymbol.sister.place();
			}
		}
		
		// store group and symbol on this
		group = outerGroup;
		symbol = outerSymbol;

		return symbol;
	};
	var getInnerGroup = function(view) {
		
		// get inner groups from subgroups
		var innerGroups = [];
		$.each(subgroups, function(index, group) {
			// get subgroup symbol
			var subsymbol = group.render(view);
			// place symbol and put into group
			innerGroups.push(subsymbol.place());
		});

		// create inner group
		var group = new paper.Group(innerGroups.concat(polygons));
		// make symbol from group
		groupSymbol = group.symbolize();

		// create a group & symbol for paths drawn into this group's polygons
		var sisterInner = innerGroups.map(function(group) { return group.sister; })
		group.sister = (sisterInner.length > 0) ? new paper.Group(sisterInner) : new paper.Group();
		groupSymbol.sister = group.sister.symbolize();

		// return symbol
		return groupSymbol;
	};
	var addPath = function(path,layer) {
		
		// find polygon the new path hits
		var hitInfo = findPolygonAt(path.firstSegment.point);
		
		if(hitInfo) {
			// create a symbol of the path
			// save original position before creating symbol
			var pathSymbol = path.symbolize();
			// add the path back to active layer
			paper.project.activeLayer.addChild(path);
			// add path to the group where the matching polygon is
			hitInfo.polygon.parent.sister.addChild(pathSymbol.place().transform(hitInfo.transform.createInverse()));
			// make path selected
			path.selected = true;
		}
	};
	var findPolygonAt = function(point) {
		return hitPolygons(point);
	};
	var hitPolygons = function(point) {
		//var that = this;
		
		var hit = false;
		var hitInfo = null;
		
		if(my.latticePoints.length > 0) {
			$.each(my.latticePoints, function(index, latticePoint) {
				// translate by -latticePoint to search within this portion of the lattice
				var curPoint = point.subtract(latticePoint);
				
				// check this groups for hits at the lattice point adjusted point
				hitInfo = hitPolygonGlobal(curPoint);
				
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
			hitInfo = hitPolygonGlobal(point);
		}
		
		return hitInfo;
	};
	// hitPolygon helper function:
	// check for hits in this group at a supplied global point
	var hitPolygonGlobal = function(point) {
		//var that = this;
		
		// check local polygons and subgroups with no transforms applied
		var hitInfo = hitPolygonLocal(point);
		// if hit, return. don't need to update transform because none was applied here
		if(hitInfo) {
			return hitInfo;
		}
		
		var hit = false;
		
		// perform reverse transforms to check local polygons and subgroups
		$.each(transforms, function(index, transform) {
			var localPoint = transform.inverseTransform(point);
			
			// do local checks
			hitInfo = hitPolygonLocal(localPoint);
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
	};
	// hitPolygon helper function:
	// check local polygons and subgroups for hits at a point in local coords
	// TODO local is actually sublocal because a transformation (maybe identity) has been applied
	// TODO the solution is to not have transforms in a group applied to polygons in the group
	var hitPolygonLocal = function(point) {
		var hit = false;
		var hitInfo = null;
		
		// check against local polygons
		$.each(polygons, function(index, polygon) {
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
		$.each(subgroups, function(index, subgroup) {
			var subHitInfo = subgroup.hitPolygons(point);
			if(subHitInfo) {
				hit = true;
				hitInfo = subHitInfo;
				return false;
			}
		});
		
		return hitInfo;
	};

	// public methods
	that.addPolygon = addPolygon;
	that.addSubgroup = addSubgroup;
	that.addTransform = addTransform;
	that.addLattice = addLattice;
	that.onResize = onResize;
	that.setRenderHead = setRenderHead;
	that.render = render;

	// accessors
	that.polygons = function(polygons_in) {
		if(polygons_in) {
			polygons = polygons_in;
		}
		return polygons;
	};
	that.subgroups = function(subgroups_in) {
		if(subgroups_in) {
			subgroups = subgroups_in;
		}
		return subgroups;
	};
	that.transforms = function(transforms_in) {
		if(transforms_in) {
			transforms = transforms_in;
		}
		return transforms;
	};
	that.lattice = function(lattice_in) {
		if(lattice_in) {
			lattice = lattice_in;
		}
		return lattice;
	};
	that.latticePoints = function() {
		return latticePoints;
	};
	that.group = function() {
		return group;
	};
	that.symbol = function() {
		return symbol;
	};
	that.latticeGroup = function() {
		return latticeGroup;
	};

	return that;
};

// Lattice represents an operator which places a polygon or group at every point in a lattice defined by two vectors
var lattice = function(spec, my) {
	var that,
		v1 = spec.v1 || new paper.Point(1,0),
		v2 = spec.v2 || new paper.Point(0,1),
		m = new paper.Matrix(v1.x, v1.y, v2.x, v2.y, 0, 0);

	var my = my || {};
	that = {};

	var toString = function() { return "L(" + v1.toString() + "," + v2.toString() + ")"; };

	var reduceBasis = function() {
		if(isReduced()) {
			return;
		}

		// basically Euclid's GCD algorithm for vectors
		// from mit open courseware stuff
		// http://ocw.mit.edu/courses/mathematics/18-409-topics-in-theoretical-computer-science-an-algorithmists-toolkit-fall-2009/lecture-notes/MIT18_409F09_scribe19.pdf
		var v1length = v1.length;
		var v2length = v2.length;
		var v;
		
		if(v2length < v1length) {
			v = v2;
			v2 = v1;
			v1 = v;
			v = v2length;
			v2length = v1length;
			v1length = v;
		}
		
		while(!isReduced()) {
			// find m to minimize v2 - m*v1
			// TODO i think this is probably not correct
			//var m = Math.floor(v2length / v1length);
			// TODO this is right, but probably really slow
			var m = 0;
			var lastLength = v2.length;
			var newlength
			while((newlength = v2.subtract(v1.multiply(m+1)).length) < lastLength) {
				m = m + 1;
				lastLength = newlength;
			}
			// set v2 = v2 - m*v1
			v2 = v2.subtract(v1.multiply(m));
			// update length
			v2length = v2.length;
			// if |v2| <= |v1|, then done
			if(v1length < v2length) {
				break;
			}
			// swap v1 and v2
			v = v2;
			v2 = v1;
			v1 = v;
			v = v2length;
			v2length = v1length;
			v1length = v;
		}

		// recompute trasnformation matrix
		computeMatrix();
	};
	var computeMatrix = function() {
		// generate transformation matrix between lattice space and project space
		m = new paper.Matrix(v1.x, v1.y, v2.x, v2.y, 0,0);
	};
	var isReduced = function() {
		return 2 * Math.abs(v1.dot(v2)) <= v1.getDistance(new paper.Point(), true);
	};
	var draw = function(range, color) {
		var circle = new paper.Path.Circle([0,0], 2);
		circle.fillColor = color || 'green';
		var symbol = new paper.Symbol(circle);
		for(var i = range.i[0]; i < range.i[1]; i++) {
			for(var j = range.j[0]; j < range.j[1]; j++) {
				symbol.place(v1.multiply(i).add(v2.multiply(j)));
			}
		}
	};
	var getPoint = function(coefs) {
		//return v1.multiply(coefs.x).add(v2.multiply(coefs.y));
		return m.transform(coefs);
	};
	var decompose = function(point) {
		// good method with matrix
		var mcoef = m.inverseTransform(point);
		return mcoef;
	};
	var closestTo = function(point) {
		var coefs = decompose(point);
		var closestCoefs = coefs.round();
		var location = getPoint(closestCoefs);
		return {point: location, coefs: closestCoefs};
	};

	// public methods
	that.toString = toString;
	that.reduceBasis = reduceBasis;
	that.isReduced = isReduced;
	that.draw = draw;
	that.getPoint = getPoint;
	that.decompose = decompose;
	that.closestTo = closestTo;

	// accessors
	that.v1 = function(v1_in) {
		if(v1_in) {
			v1 = v1_in;
		}
		return v1;
	}
	that.v2 = function(v2_in) {
		if(v2_in) {
			v2 = v2_in;
		}
		return v2;
	}

	return that;
};
