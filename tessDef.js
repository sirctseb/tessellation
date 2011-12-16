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
		//symbols: [], // one per polygon
		//groups: [], // one per copy of the inner polygroup
		// TODO ?
		toString: function() { return this.polygons.toString() + /*this.polygroup.toString() + */this.transforms.toString(); },
		addPolygon: function(polygon) {
			// add to list
			this.polygons.push(polygon);
			// create symbol from polygon
			// store original position of the polygon because it will be set to zero when we symbolize it
			var origPosition = polygon.position;
			// create the symbol
			var symbol = new paper.Symbol(polygon);
			// restore position of polygon
			polygon.position = origPosition;
			// add symbol to list
			this.symbols.push(symbol);
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
			
			// get the group with the subgroups and local symbol placements
			var innerGroup = this.getInnerGroup(view);
			
			// set it as the outer group
			var outerGroup = innerGroup;
			
			var that = this;
			
			// if PG has transforms, make a copy of inner group for each and apply transform
			if(this.transforms.length > 0) {
				
				// if there are any transforms, update outer group to be the transform group
				// and add the inner group to it
				outerGroup = new paper.Group([innerGroup]);
				
				// parse transforms and apply operations
				$.each(this.transforms, function(index, transform) {
					
					// create group for the transform and add innerGroups and local symbol placements
					// TODO would Group.clone() be better or faster?
					var group = that.getInnerGroup(view);
					//var group = innerGroup.clone();
					group.transform(transform);
					
					// put transformed groups in outer group
					outerGroup.addChild(group);
					
					// TODO alternatively
					//innerGroup.copyTo(outerGroup);
					//outerGroup.lastChild.transform(transform);
				});
			}
			
			// if there is a lattice defined, copy this group to each point
			if(this.lattice) {
				
				// create a group for the lattice which will become the outer group
				var latticeGroup = new paper.Group();
				// remove singular instance of outer group from project
				outerGroup.remove();
				
				// TODO figure out what lattice points are in view
				// TODO for testing, just do four points or so
				for(var i = 0; i < 4; i++) {
					for(var j = 0; j < 4; j++) {
						// compute lattice point
						var location = this.lattice.v1.multiply(i).add(this.lattice.v2.multiply(j));
						// add lattice point to list of lattice points
						this.latticePoints.push(location);
						// create copy of outer group and add it to the lattice group
						outerGroup.copyTo(latticeGroup);
						// translate copy of outer group to lattice point
						latticeGroup.lastChild.translate(location);
					}
				}
				
				// update the outer group to be the lattice group
				outerGroup = latticeGroup;
			}

			this.group = outerGroup;
			return outerGroup;
		},
		getInnerGroup: function(view) {
			
			// get inner groups from subgroups
			var innerGroups = [];
			$.each(this.subgroups, function(index, group) {
				innerGroups.push(group.render(view));
			});
			
			// place local symbols
			var placedSymbols = [];
			$.each(this.symbols, function(index, symbol) {
				placedSymbols.push(symbol.place());
			});
			
			//return innerGroups.concat(placedSymbols);
			return new paper.Group(innerGroups.concat(placedSymbols));
		},
		addPath: function(path) {
			this.polygons[0].addChild(path);
			return;
			
			// find polygon the new path hits
			//var item = this.findPolygonAt(path.firstSegment.point);
			var item = this.symbols[0].definition;
			
			// if there is one, find its parent group
			if(item) {
				var group = item.parent;
				
				// make the path a symbol and put it in each group which contains a placement
				// of the hit polygon
				var origPosition = path.position;
				var symbol = new paper.Symbol(path);
				path.position = origPosition;
				$.each(item.placements, function(index, placement) {
					placement.parent.addChild(symbol.place());
				});
			}
		},
		findPolygonAt: function(point) {
			return hitPolygons(point);
		},
		hitPolygons: function(point) {
			var that = this;
			
			var hit = false;
			var hitPolygon = null;
			
			// TODO It's kind of gross to have to return false out of all of these.
			// is there a better way? exceptions?
			
			// TODO what if no lattice points?
			if(this.latticePoints.length > 0) {
				$.each(this.latticePoints, function(index, latticePoint) {
					var curPoint = point.subtract(latticePoint);
					
					// check this groups for hits at the lattice point adjusted point
					hitPolygon = that.hitPolygonGlobal(curPoint);
					// if hit, return from latticePoint loop
					if(hitPolygon) {
						hit = true;
						return false;
					}
				});
			} else {
				// if no lattice, just do test at given point
				hitPolygon = that.hitPolygonGlobal(point);
			}
			
			return hitPolygon;
		},
		// hitPolygon helper function:
		// check for hits in this group at a supplied global point
		hitPolygonGlobal: function(point) {
			var that = this;
			
			// check local polygons and subgroups with no transforms applied
			var hitPolygon = that.hitPolygonLocal(point);
			// if hit, return
			if(hitPolygon) {
				return hitPolygon;
			}
			
			var hit = false;
			// perform reverse transforms to check local polygons and subgroups
			// TODO what if no transforms? answer: that is taken care of above
			$.each(this.transforms, function(index, transform) {
				var localPoint = transform.inverseTransform(point);
				
				// do local checks
				hitPolygon = that.hitPolygonLocal(localPoint);
				// if hit, return
				if(hitPolygon) {
					hit = true;
					return false;
				}
			});
			
			// if we found a hit, return the hit polygon
			if(hit) {
				return hitPolygon;
			}
		},
		// hitPolygon helper function:
		// check local polygons and subgroups for hits at a point in local coords
		// TODO local is actually sublocal because a transformation (maybe identity) has been applied
		// TODO the solution is to not have transforms in a group applied to polygons in the group
		hitPolygonLocal: function(point) {
			var hit = false;
			var hitPolygon = null;
			
			// check against local polygons
			$.each(this.polygons, function(index, polygon) {
				if(isInterior(point, polygon)) {
					hit = true;
					hitPolygon = polygon;
					return false;
				}
			});
			
			// if we hit a local polygon, return
			if(hit) {
				return hitPolygon;
			}
			
			// if no local polygon hits, recurse into subgroups
			$.each(this.subgroups, function(index, subgroup) {
				var subHit = subgroup.hitPolygons(point);
				if(subHit) {
					hit = true;
					hitPolygon = subHit;
					return false;
				}
			});
			
			return hitPolygon;
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
		LatticeBy: function(vec1, vec2) { var lattice = Object.create(Lattice); lattice.v1 = vec1; lattice.v2 = vec2; return lattice; }
	};
	
	var innerGroup44 = CreatePolyGroup();//Object.create(PolyGroup);
	innerGroup44.addPolygon(SquarePoly);
	var PolyGroup44 = CreatePolyGroup();//Object.create(PolyGroup);
	PolyGroup44.addLattice(Lattice.LatticeBy(new paper.Point([0,100]), new paper.Point([100,0])));
	PolyGroup44.addSubgroup(innerGroup44);
	
	var innerGroupHex = CreatePolyGroup();
	innerGroupHex.addPolygon(TrianglePoly.clone());
	var rotGroupHex = CreatePolyGroup();
	//rotGroupHex.addTransform(Rotation.rotBy(60, TrianglePoly.firstSegment.point));
	rotGroupHex.addTransform(new paper.Matrix().rotate(60, TrianglePoly.firstSegment.point));
	rotGroupHex.addSubgroup(innerGroupHex);
	var latGroupHex = CreatePolyGroup();
	latGroupHex.addLattice(Lattice.LatticeBy(TrianglePoly.segments[1].point.subtract(TrianglePoly.segments[0].point),
											TrianglePoly.segments[2].point.subtract(TrianglePoly.segments[1].point)));
	latGroupHex.addSubgroup(rotGroupHex);
	
	// new formulation in a single group
	/*var latGroupHex = CreatePolyGroup();
	latGroupHex.addPolygon(TrianglePoly);
	latGroupHex.addTransform(new paper.Matrix().rotate(60, TrianglePoly.firstSegment.point));
	// TODO testing
	//for(var i = 10; i < 90; i+=10) {
	//	latGroupHex.addTransform(Rotation.rotBy(i));
	//}
	latGroupHex.addLattice(Lattice.LatticeBy(TrianglePoly.segments[1].point.subtract(TrianglePoly.segments[0].point),
											TrianglePoly.segments[2].point.subtract(TrianglePoly.segments[1].point)));*/
											
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
