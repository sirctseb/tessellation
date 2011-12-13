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
	
	// TODO constructors for the types?
	
	// Poly represents a single polygon
	/*var Poly = {
		polygon: {},
		toString: function() { return this.polygon.toString(); }
	};*/
	// TODO convenience polygon defs
	//var SquarePoly = Object.create(Poly);
	// TODO do something about these 0.5s everywhere
	//SquarePoly.polygon = new paper.Path.Rectangle([0.5,0.5], [100.5, 100.5]);
	//SquarePoly.polygon = new paper.Path.Rectangle([0,0], [100,100]);
	//SquarePoly.polygon.strokeColor = 'black';
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
					// TODO would Group.clone() work and be better or faster?
					var group = that.getInnerGroup(view);
					transform.applyTransform(group);
					
					// put transformed groups in outer group
					outerGroup.addChild(group);
				});
			}
			
			// if there is a lattice defined, copy this group to each point
			if(this.lattice) {
				
				// create a group for the lattice which will become the outer group
				var latticeGroup = new paper.Group();
				
				// TODO figure out what lattice points are in view
				// TODO for testing, just do four points or so
				for(var i = -2; i < 2; i++) {
					for(var j = -2; j < 2; j++) {
						// compute lattice point
						var location = this.lattice.v1.multiply(i).add(this.lattice.v2.multiply(j));
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
		}
	};
	var CreatePolyGroup = function() {
		var newPolyGroup = Object.create(PolyGroup);
		newPolyGroup.polygons = [];
		newPolyGroup.transforms = [];
		newPolyGroup.symbols = [];
		newPolyGroup.subgroups = [];
		return newPolyGroup;
	};
	
	
	// common transform stuff
	var Transform = {
		applyTransform: function(item) {
			this.applyMyTransform(item);
			if(this.nextTransform) {
				this.nextTransform.applyTransform(item);
			}
		},
		nextTransform: null
	};
	
	// Copy represents an operator which copies a polygon or polygroup
	var Copy = $.extend(Transform, {
		toString: function() { return ":"; },
		applyMyTransform: function(item) {
		}
	});
	
	// Rotation represents an operator which rotates a polygon or group by a number of degrees
	var Rotation = $.extend(Object.create(Transform),
	{
		rotation: 0,
		center: null,
		toString: function() { return "R(" + this.rotation + ")"; },
		rotBy: function(rot, center) {
			var R = Object.create(Rotation);
			R.rotation = rot;
			if(center) {
				R.center = center;
			}
			return R;
		},
		applyMyTransform: function(item) {
			item.rotate(this.rotation, this.center);
		}
	});
	
	// Translation represents an operator which translates a polygon or group by a vector
	var Translation = $.extend(Object.create(Transform),
	{
		translation: new paper.Point(),
		toString: function() { return "T(" + this.translation.toString() + ")"; },
		applyMyTransform: function(item) {
			item.translate(this.translation);
		}
	});
	
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
	innerGroupHex.addPolygon(TrianglePoly);
	var rotGroupHex = CreatePolyGroup();
	rotGroupHex.addTransform(Rotation.rotBy(60, TrianglePoly.firstSegment.point));
	rotGroupHex.addSubgroup(innerGroupHex);
	var latGroupHex = CreatePolyGroup();
	latGroupHex.addLattice(Lattice.LatticeBy(TrianglePoly.segments[1].point.subtract(TrianglePoly.segments[0].point),
											TrianglePoly.segments[2].point.subtract(TrianglePoly.segments[1].point)));
	latGroupHex.addSubgroup(rotGroupHex);
	
	$.extend(tessDef, {
		//Poly: Poly,
		PolyGroup: PolyGroup,
		Copy: Copy,
		Rotation: Rotation,
		Translation: Translation,
		Lattice: Lattice,
		PolyGroup44: PolyGroup44,
		//GroupHex: rotGroupHex
		GroupHex: latGroupHex
	});
	
	return tessDef;
});
