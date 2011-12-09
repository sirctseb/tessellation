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

var tessDef = (function() {
	var tessDef;
	
	// TODO constructors for the types?
	
	// Poly represents a single polygon
	var Poly = {
		polygon: {},
		toString: function() { return this.polygon.toString(); }
	};
	// TODO convenience polygon defs
	var SquarePoly = Object.create(Poly);
	// TODO do something about these 0.5s everywhere
	SquarePoly.polygon = new paper.Path.Rectangle([0.5,0.5], [100.5, 100.5]);
	
	// PolyGroup represents a set of polygons or a PolyGroup with transformations applied
	var PolyGroup = {
		polygons: [],
		polygroup: {},
		transforms: [],
		lattice: {},
		symbols: [], // one per polygon
		groups: [], // one per copy of the inner polygroup
		// TODO ?
		toString: function() { return this.polygons.toString() + this.polygroup.toString() + this.transforms.toString(); },
		addPolygon: function(polygon) {
			// add to list
			this.polygons.push(polygon);
		},
		addTransform: function(transform) { this.transforms.push(transform); },
		addLattice: function(lattice) { this.lattice = lattice; },
		// render in a view
		render: function(view) {
			// make sure symbols and groups arrays are empty
			this.symbols = [];
			this.groups = [];
			
			// create symbols from each polygon
			$.each(this.polygons, function(polygon, index) {
				// store position of polygon
				var origPosition = polygon.position;
				// make symbol from polygon
				var symbol = new paper.Symbol(polygon);
				// add it to symbol array
				this.symbols.push(symbol);
				// making symbol positions polygon at (0,0), so restore it to it's original position
				polygon.position = origPosition;
				// add the polygon back to the layer
				paper.project.activeLayer.addChild(polygon);
			});
			
			// parse transforms and apply operations
			$.each(this.transforms, function(transform, index) {
				// create group for each transform?
				var group = new paper.Group();
				transform.applyTransform(group);
			});
		}
	};
	
	// Copy represents an operator which copies a polygon or polygroup
	var Copy = {
		toString: function() { return ":"; }
	};
	
	// Rotation represents an operator which rotates a polygon or group by a number of degrees
	var Rotation = {
		rotation: 0,
		center: null,
		toString: function() { return "R(" + this.rotation + ")"; },
		rotBy: function(rot) { var R = Object.create(Rotation); R.rotation = rot; return R; },
		applyTransform: function(item) {
			item.rotate(this.rotation, this.center);
		}
	};
	
	// Translation represents an operator which translates a polygon or group by a vector
	var Translation = {
		translation: new paper.Point(),
		toString: function() { return "T(" + this.translation.toString() + ")"; },
		applyTransform: function(item) {
			item.translate(this.translation);
		}
	};
	
	// Lattice represents an operator which places a polygon or group at every point in a lattice defined by two vectors
	var Lattice = {
		v1: new paper.Point(),
		v2: new paper.Point(),
		toString: function() { return "L(" + this.v1.toString() + "," + this.v2.toString() + ")"; },
		LatticeBy: function(vec1, vec2) { var lattice = Object.create(Lattice); lattice.v1 = vec1; lattice.v2 = vec2; return lattice; }
	};
	
	var PolyGroup44 = Object.create(PolyGroup);
	PolyGroup44.addPolygon(SquarePoly);
	PolyGroup44.addTransform(Copy);
	PolyGroup44.addLattice(Lattice.LatticeBy(new paper.Point([0,100]), new paper.Point([100,0])));
	
	$.extend(tessDef, {
		Poly: Poly,
		PolyGroup: PolyGroup,
		Copy: Copy,
		Rotation: Rotation,
		Translation: Translation,
		Lattice: Lattice,
		PolyGroup44: PolyGroup44
	});
	
	return tessDef;
})();
