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
		lattice = [];

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
		transforms.push(transform);
	};
	var addLattice = function(lattice_in) {
		lattice = lattice_in;
	};
	// TODO debugging method to add label on a lattice placement
	var addLabel = function(point, content) {
		var label = new paper.PointText(point);
		label.content = content;
		label.paragraphStyle.justification = 'center';
		label.strokeColor = 'blue';
		return label;
	};

	// public methods
	that.addPolygon = addPolygon;
	that.addSubgroup = addSubgroup;
	that.addTransform = addTransform;
	that.addLattice = addLattice;

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

	that.serialize() {
		return {
			polygons:
				polygons.map(function(polygon) {
					polygon.segments.map(function(segment) {
						return segment.point.serialize();
					});
				}),

			subgroups: 
				subgroups.map(function(subgroup) {
					return subgroup.serialize();
				}),
			transforms;
				transforms.map(function(transform) {
					return transform.serialize();
				});
			lattice: lattice.serialize()
		};
	}

	that.deserialize(map) {
		polygons = map.polygons.map(function(points) {
			return paper.Path(
				points.map(function(point) {
					return new paper.Point(point);
				});
			);
		});

		subgroups = map.subgroups.map(function(subgroupmap) {
			var subgroup = tessellationModel();
			subgroup.deserialize(subgroupmap);
			subgroup.parent = that;
			return subgroup;
		});

		transforms = map.transforms.map(function(transformmap) {
			var transform = new paper.Matrix();
			transform.deserialize(trasnformmap);
			return transform;
		});

		lattice.deserialize(map.lattice);
	}

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
			computeMatrix();
		}
		return v1;
	}
	that.v2 = function(v2_in) {
		if(v2_in) {
			v2 = v2_in;
			computeMatrix();
		}
		return v2;
	}

	that.serialize = function() {
		return {v1: v1.serialize(), v2: v2.serialize(), m: m.serialize()};
	};

	that.deserialize = function(map) {
		v1 = new paper.Point(map.v1);
		v2 = new paper.Point(map.v2);
		m = new paper.Matrix();
		m.deserialize(map.m);
		return this;
	};
	
	return that;
};
