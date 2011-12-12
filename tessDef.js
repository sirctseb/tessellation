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
	
	// PolyGroup represents a set of polygons or a PolyGroup with transformations applied
	var PolyGroup = {
		polygons: null,
		// a nested polygon group that will be transformed by this PG's transforms or lattice
		polygroup: null,
		transforms: null,
		lattice: null,
		symbols: null,
		//symbols: [], // one per polygon
		//groups: [], // one per copy of the inner polygroup
		// TODO ?
		toString: function() { return this.polygons.toString() + this.polygroup.toString() + this.transforms.toString(); },
		addPolygon: function(polygon) {
			// add to list
			this.polygons.push(polygon);
			// TODO make symbol on add?
			var origPosition = polygon.position;
			var symbol = new paper.Symbol(polygon);
			polygon.position = origPosition;
			this.symbols.push(symbol);
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
			// make sure symbols and groups arrays are empty
			//var symbols = this.symbols = [];
			var groups = this.groups = [];
			
			// create symbols from each polygon (TODO and put into group?)
			// TODO create group?
			var symbolGroup = new paper.Group();
			//$.each(this.polygons, function(index, polygon) {
			$.each(this.symbols, function(index, symbol) {
				// store position of polygon
				//var origPosition = polygon.position;
				// make symbol from polygon
				//var symbol = new paper.Symbol(polygon);
				// add it to symbol array
				//symbols.push(symbol);
				// making symbol positions polygon at (0,0), so restore it to it's original position
				//polygon.position = origPosition;
				// add the polygon back to the layer
				// TODO this?
				//paper.project.activeLayer.addChild(polygon);
				
				// TODO put into group?
				symbolGroup.addChild(symbol.place());
			});
			// TODO add group to groups
			groups.push(symbolGroup);
			
			// if PG has transforms, apply them
			if(this.transforms.length > 0) {
				// parse transforms and apply operations
				$.each(this.transforms, function(index, transform) {
					
					// create group for the transform and add innerGroups and local symbol placements
					var group = new paper.Group(this.getInnerGroups(view));
					transform.applyTransform(group);
					
					// add to the array of the groups from this PG
					groups.push(group);
				});
			} else if(this.lattice) {
				// if no transforms, but there is a lattice, do lattice
				// TODO figure out what lattice points are in view
				// TODO for testing, just do four points or so
				for(var i = 0; i < 2; i++) {
					for(var j = 0; j < 2; j++) {
						var location = this.lattice.v1.multiply(i).add(this.lattice.v2.multiply(j));
						// create group for the transform and add innerGroups and local symbol placements
						// TODO had to special case for when there are no inner groups.
						// TODO but should that ever be the case?
						var innerGroups = this.getInnerGroups(view);
						var group;
						if(innerGroups.length > 0) {
							group = new paper.Group(innerGroups);
						} else {
							group = new paper.Group();
						}
						//var group = new paper.Group(this.getInnerGroups(view));
						group.translate(location);
						
						// add to the array of the groups from this PG
						groups.push(group);
					}
				}	
			} else {
				// if no transforms and no lattice, just place symbols into group
				groups.push()
			}
			
			return groups;
		},
		getInnerGroups: function(view) {
			// get inner groups from inner polygroup
			var innerGroups = [];
			if(this.polygroup) {
				innerGroups = this.polygroup.render(view);
			}
			
			// place local symbols
			var placedSymbols = [];
			$.each(this.symbols, function(index, symbol) {
				placedSymbols.push(symbol.place());
			});
			
			return innerGroups.concat(placedSymbols);
		}
	};
	var CreatePolyGroup = function() {
		var newPolyGroup = Object.create(PolyGroup);
		newPolyGroup.polygons = [];
		newPolyGroup.transforms = [];
		newPolyGroup.symbols = [];
		return newPolyGroup;
	};
	
	// Copy represents an operator which copies a polygon or polygroup
	var Copy = {
		toString: function() { return ":"; }
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
	
	// Rotation represents an operator which rotates a polygon or group by a number of degrees
	var Rotation = $.extend(Object.create(Transform),
	{
		rotation: 0,
		center: null,
		toString: function() { return "R(" + this.rotation + ")"; },
		rotBy: function(rot) { var R = Object.create(Rotation); R.rotation = rot; return R; },
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
	PolyGroup44.polygroup = innerGroup44;
	
	$.extend(tessDef, {
		//Poly: Poly,
		PolyGroup: PolyGroup,
		Copy: Copy,
		Rotation: Rotation,
		Translation: Translation,
		Lattice: Lattice,
		PolyGroup44: PolyGroup44
	});
	
	return tessDef;
});
