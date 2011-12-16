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

// TODO I have nowhere else to put this note:
// if we have a compound path as a symbol definition, we can have
// new paths added to the compound path and not even have to go through
// to add individual path symbols to each symmetry group

// check if a point is in the interior of an assumed convex polygon
// TODO put this somewhere better
var isInterior = function(point, path) {
	if(!path.closed) {
		return false;
	}

	var interior = true;
	var that = path;
	$.each(path.curves, function(index, curve) {
		var p1 = that.clockwise ? curve.point1 : curve.point2;
		var p2 = that.clockwise ? curve.point2 : curve.point1;
		var vec = p2.subtract(p1);
		var orthogonal = new paper.Point(vec.y, -vec.x);
		if(orthogonal.dot(p1.negate().add(point)) > 0) {
			interior = false;
			return false;
		}
	});
	
	return interior;
};

var initTessDef = (function() {
	
	var tessDef = {};
	
	var SquarePoly = new paper.Path.Rectangle([0,0],[100,100]);
	SquarePoly.strokeColor = 'black';
	SquarePoly.remove();
	var TrianglePoly = new paper.Path.RegularPolygon([50,50], 3, 50);
	TrianglePoly.strokeColor = 'black';
	TrianglePoly.remove();
	
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
			
			// TODO trying to use symbol placements instead of groups at a higher level, so keep polygons as paths
			/*
			// create symbol from polygon
			// store original position of the polygon because it will be set to zero when we symbolize it
			var origPosition = polygon.position;
			// create the symbol
			var symbol = new paper.Symbol(polygon);
			// restore position of polygon
			polygon.position = origPosition;
			// add symbol to list
			this.symbols.push(symbol);
			*/
		},
		addSubgroup: function(group) {
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
		// render in a view
		render: function(view) {
			// if the symbol for this group is already defined, return it
			if(this.symbol) {
				return this.symbol;
			}
			
			// get the group with the subgroups and local symbol placements
			var innerSymbol = this.getInnerGroup(view);
			
			// place inner symbol into main polygroup group
			var outerGroup = new paper.Group([innerSymbol.place()]);

			var that = this;
			
			// if PG has transforms, make a copy of inner group for each and apply transform
			if(this.transforms.length > 0) {
				
				// parse transforms and apply operations
				$.each(this.transforms, function(index, transform) {
					
					// add transformed placed inner symbol into group 
					outerGroup.addChild(innerSymbol.place().transform(transform));
				});
			}
			// store position of outer group before making symbol
			var origPosition = outerGroup.position;
			// make symbol from outer group
			var outerSymbol = new paper.Symbol(outerGroup);
			// restore position of group
			outerGroup.position = origPosition;
			
			// if there is a lattice defined, copy this group to each point
			if(this.lattice) {
				
				// create a group for the lattice which will become the outer group
				var latticeGroup = new paper.Group();
				
				// TODO figure out what lattice points are in view
				// TODO for testing, just do four points or so
				for(var i = 0; i < 4; i++) {
					for(var j = 0; j < 4; j++) {
						// compute lattice point
						var location = this.lattice.v1.multiply(i).add(this.lattice.v2.multiply(j));
						// add lattice point to list of lattice points
						this.latticePoints.push(location);
						// add placed outer symbol to lattice group
						latticeGroup.addChild(outerSymbol.place(location));
					}
				}
				
				// update the outer group to be the lattice group
				outerGroup = latticeGroup;
				// create symbol for entire thing
				// save position before creating symbol
				origPosition = outerGroup.position;
				// create symbol
				var latticeSymbol = new paper.Symbol(outerGroup);
				// restore position
				outerGroup.position = origPosition;
				// store group and symbol on this
				this.group = outerGroup;
				this.symbol = latticeSymbol;
				// finally, place entire symbol
				this.symbol.place();
			} else {
				// if there is no lattice, place one instance of the symbol for this group
				outerSymbol.place();
				// and store group and symbol on this
				this.group = outerGroup;
				this.symbol = outerSymbol;
			}

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
			// TODO make function for creating a symbol without changing the definition item's position
			// store position before making symbol
			var origPosition = group.position;
			// make symbol
			var symbol = new paper.Symbol(group);
			// restore position
			group.position = origPosition;
			// return symbol
			return symbol;
		},
		addPath: function(path) {
			
			// find polygon the new path hits
			var hitInfo = this.findPolygonAt(path.firstSegment.point);
			
			if(hitInfo) {
				// create a symbol of the path
				// save original position before creating symbol
				var origPosition = path.position;
				// create symbol
				var symbol = new paper.Symbol(path);
				// restore position
				path.position = origPosition;
				// add the path back to active layer
				paper.project.activeLayer.addChild(path);
				// add path to the group where the matching polygon is
				hitInfo.polygon.parent.addChild(symbol.place().transform(hitInfo.transform.createInverse()));
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
				if(isInterior(point, polygon)) {
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
		newPolyGroup.group = new paper.Group();
		newPolyGroup.latticePoints = [];
		return newPolyGroup;
	};
	
	// Lattice represents an operator which places a polygon or group at every point in a lattice defined by two vectors
	var Lattice = {
		v1: new paper.Point(),
		v2: new paper.Point(),
		toString: function() { return "L(" + this.v1.toString() + "," + this.v2.toString() + ")"; },
		LatticeBy: function(vec1, vec2) { var lattice = Object.create(Lattice); lattice.v1 = vec1; lattice.v2 = vec2; return lattice; },
		reduceBasis: function() {
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
				var m = Math.floor(v2length / v1length);
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
		}
	};
	
	var innerGroup44 = CreatePolyGroup();//Object.create(PolyGroup);
	innerGroup44.addPolygon(SquarePoly);
	var PolyGroup44 = CreatePolyGroup();//Object.create(PolyGroup);
	PolyGroup44.addLattice(Lattice.LatticeBy(new paper.Point([0,100]), new paper.Point([100,0])));
	PolyGroup44.addSubgroup(innerGroup44);
	
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
	latGroupHex.addTransform(new paper.Matrix().rotate(60, TrianglePoly.firstSegment.point));
	// TODO testing
	//for(var i = 10; i < 90; i+=10) {
	//	latGroupHex.addTransform(Rotation.rotBy(i));
	//}
	latGroupHex.addLattice(Lattice.LatticeBy(TrianglePoly.segments[1].point.subtract(TrianglePoly.segments[0].point),
											TrianglePoly.segments[2].point.subtract(TrianglePoly.segments[1].point)));
											
	var hitTestGroup = CreatePolyGroup();
	hitTestGroup.addPolygon(TrianglePoly.clone());
	// TODO write group with transforms so we can test hitPolygons
	hitTestGroup.addTransform(new paper.Matrix().rotate(60, TrianglePoly.firstSegment.point));
	hitTestGroup.addTransform(new paper.Matrix().rotate(120, TrianglePoly.firstSegment.point));
	hitTestGroup.addTransform(new paper.Matrix().rotate(180, TrianglePoly.firstSegment.point));
	
	$.extend(tessDef, {
		//Poly: Poly,
		PolyGroup: PolyGroup,
		Lattice: Lattice,
		PolyGroup44: PolyGroup44,
		//GroupHex: rotGroupHex
		GroupHex: latGroupHex,
		HitGroup: hitTestGroup
	});
	
	return tessDef;
});
