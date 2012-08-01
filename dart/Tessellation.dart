/** [Tessellation] is the representation of a tessellation
 */
#library("Tessellation");
#import("dart:math");

class Tessellation {
  
  // private fields
  List<List<Vector2>> _polygons;
  List<Tessellation> _subgroups;
  List<Matrix> _transforms;
  Lattice _lattice;
  Tessellation _parent;
  
  // accessors to fields
  List<List<Vector2>> get polygons() => _polygons;
  List<Tessellation> get subgroups() => _subgroups;
  List<Matrix> get transforms() => _transforms;
  Lattice get lattice() => _lattice;
  Lattice set lattice(value) => _lattice = value;
  Tessellation get parent() => _parent;
  
  // addition methods
  // TODO are clients only supposed to use these?
  // how to prevent from just using the accessors?
  void addPolygon(var polygon) {
    _polygons.add(polygon);
  }
  void addSubgroup(Tessellation subgroup) {
    _subgroups.add(subgroup);
    subgroup._parent = this;
  }
  void addTransform(var transform) {
    _transforms.add(transform);
  }  
  void setLattice(Lattice lattice) {
    _lattice = lattice;
  }
  
  Tessellation() {
    _polygons = new List<List<Vector2>>();
    _subgroups = new List<Tessellation>();
    _transforms = new List<Matrix>();
    _lattice = new Lattice();
    _parent = null;
  }

  Map serialize() {
    return {
      "polygons": polygons.map((points) => points.map((point) => point.serialize())),

      "subgroups": subgroups.map((sg) => sg.serialize()),

      "transforms": transforms.map((t) => t.serialize()),

      "lattice" : lattice.serialize()
    };
  }

  void deserialize(Map map) {
    // TODO what are polygons?
    _polygons = map["polygons"].map((pmap)
      => pmap.map((point)
        => new Vector2.fromMap(point)
      )
    );
      
    _subgroups = map["subgroups"].map((sgmap) {
      var subgroup = new Tessellation.fromMap(sgmap);
      subgroup.parent = this;
      return subgroup;
    });

    // if we knew that we had the same number of transforms, we could
    // deserialize existing instances
    _transforms = map["transforms"].map((tmap) => new Matrix.fromMap(map));

    _lattice.deserialize(map["lattice"]);
  }

  Tessellation.fromMap(Map map) {
    _lattice = new Lattice();
    deserialize(map);
  }
}

/** [Vector2] represents a two dimensional vector **/
class Vector2 {
  // components
  num x, y;

  // Constructor
  Vector2(this.x, this.y);

  // indexed accessors
  num operator[] (int index) {
    if(index != 0 && index != 1) {
      throw new IllegalArgumentException("Index must be 0 or 1");
    }
    return index == 0 ? x : y;
  }

  // length
  num get length() => sqrt(this.x*this.x + this.y*this.y);
  // length squared
  num get length2() => this.x*this.x + this.y*this.y;

  // Arithmetic operations
  // Negation
  Vector2 operator negate() {
    return new Vector3(-this.x, -this.y);
  }
  // Addition
  Vector2 operator+ (Vector2 v2) {
    return new Vector2(this.x + v2.x, this.y + v2.y);
  }
  // Subtraction
  Vector2 operator- (Vector2 v2) {
    return new Vector2(this.x - v2.x, this.y - v2.y);
  }
  // Dot product and scalar product
  Object operator* (var multiplicand) {
    // dot product
    if(multiplicand is Vector2) {
      return this.x*v2.x + this.y*v2.y;
    }
    // scalar product
    return new Vector2(this.x * multiplicand, this.y * multiplicand);
  }

  // return a rounded vector
  Vector2 round() {
    // TODO make sure round does the right thing here
    new Vector2(this.x.round(), this.y.round());
  }

  Map serialize() {
    return {"x": x, "y": y};
  }
  void deserialize(Map map) {
    x = map["x"];
    y = map["y"];
  }
  Vector2.fromMap(Map map) {
    deserialize(map);
  }
}
/** [Matrix] is a dart port of the Matrix class from paper.js
  * https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js
  *
  * @class An affine transform performs a linear mapping from 2D coordinates
  * to other 2D coordinates that preserves the "straightness" and
  * "parallelness" of lines.
  *
  * Such a coordinate transformation can be represented by a 3 row by 3
  * column matrix with an implied last row of [ 0 0 1 ]. This matrix
  * transforms source coordinates (x,y) into destination coordinates (x',y')
  * by considering them to be a column vector and multiplying the coordinate
  * vector by the matrix according to the following process:
  * <pre>
  * [ x ]   [ a b tx ] [ x ]   [ a * x + b * y + tx ]
  * [ y ] = [ c d ty ] [ y ] = [ c * x + d * y + ty ]
  * [ 1 ]   [ 0 0 1  ] [ 1 ]   [ 1 ]
  * </pre>
  *
  * This class is optimized for speed and minimizes calculations based on its
  * knowledge of the underlying matrix (as opposed to say simply performing
  * matrix multiplication).
  **/
class Matrix {
  // actual values
  num _a; // scaleX
  num _c; // shearY
  num _b; // shearX
  num _d; // scaleY
  num _tx; // translateX
  num _ty; // translateY

  // named read-only accessors
  num get scaleX() => _a;
  num get shearY() => _c;
  num get shearX() => _b;
  num get scaleY() => _d;
  num get translateX() => _tx;
  num get translateY() => _ty;


  // Constructors
  Matrix.withValues(this._a, this._c, this._b, this._d, this._tx, this._ty);
  Matrix() {
    this.setIdentity();
  }
  Matrix.fromRotation(num angle, Vector2 center) {
    angle = angle * PI / 180;
    num x = center.x;
    num y = center.y;
    num c = cos(angle);
    num s = sin(angle);
    _a = c;
    _c = s;
    _b = -s;
    _d = -c;
    _tx = x - x * c + y * s;
    _ty = y - x * s - y * c;
  }

  // set to identity matrix
  setIdentity() {
    this._a = this._d = 1;
    this._c = this._b = this._tx = this._ty = 0;
    return this;
  }

  // Concatenate this transform with a scaling transformation
  Matrix scale(num hor, num vert, [Vector2 center = null]) {
    // TODO allow only one scaling factor plus a center

    // do translate if center supplied
    if(center != null) {
      this.translate(center);
    }

    this._a *= hor;
    this._c *= hor;
    this._b *= ver;
    this._d *= ver;

    // undo translate if center supplied   
    if(center != null) {
      this.translate(-center);
    }

    return this;
  }

  // Concatenate this transform with a translate transformation
  Matrix translate(Vector2 point) {
    this._tx += point.x * this._a + point.y * this._b;
    this._ty += point.x * this._c + point.y * this._d;
    return this;
  }

  // concatenate this transform with a rotaiton transformation about an anchor point
  Matrix rotate(num angle, [Vector2 center = null]) {
    this.concatenate(new Matrix.fromRotation(angle, center));
  }

  // Concatenate this transform with a shear transformation
  // TODO
  // Matrix shear() {}

  // Concatenate an affine transform to this transform
  Matrix concatenate(Matrix m) {
    num a = _a;
    num b = _b;
    num c = _c;
    num d = _d;
    _a = m._a * a + m._c * b;
    _b = m._b * a + m._d * b;
    _c = m._a * c + m._c * d;
    _d = m._b * c + m._d * d;
    _tx += m._tx * a + m._ty * b;
    _ty += m._tx * c + m._ty * d;
    return this;
  }

  // Pre-concatenate an affine transform to this transform
  Matrix preConcatenate(Matrix m) {
    num a = _a;
    num b = _b;
    num c = _c;
    num d = _d;
    num tx = _tx;
    num ty = _ty;
    _a = m._a * a + m._b * c;
    _b = m._a * b + m._b * d;
    _c = m._c * a + m._d * c;
    _d = m._c * b + m._d * d;
    _tx = m._a * tx + m._b * ty + m._tx;
    _ty = m._c * tx + m._d * ty + m._ty;
    return this;
  }

  // transform a Vector2
  Vector2 transform(Vector2 v) {
    return new Vector2(
      v.x * _a + v.y * _b * _tx,
      v.x * _c + v.y * _d + _ty
    );
  }
  // inverse transform a Vector2
  Vector2 inverseTransform(Vector2 v) {
    num det = this.getDeterminant();
    return new Vector2(
      (v.x * _d - v.y * _b) / det,
      (v.y * _a - v.x * _c) / det
    );
  }

  // get the determinant of the matrix or null
  num getDeterminant() {
    // TODO check for reversible
    return _a * _d - _b * _c;
  }

  Vector2 getTranslation()  {
    return new Vector2(_tx, _ty);
  }
  Vector2 getScaling() {
    num hor = sqrt(_a*_a + _c*_c);
    num ver = sqrt(_b*_b + _d*_d);
    return new Vector2(_a < 0 ? -hor : hor, _b < 0 ? -ver : ver);
  }

  // TODO check for non-uniform rotation
  num getRotation() {
    return atan2(_b, _d) * 180 / PI;
  }

  Map serialize() {
    return {"a": _a, "b": _b, "c": _c, "d": _d, "tx": _tx, "ty": _ty};
  }
  void deserialize(Map map) {
    _a = map["a"];
    _b = map["b"];
    _c = map["c"];
    _d = map["d"];
    _tx = map["tx"];
    _ty = map["ty"];
  }
  Matrix.fromMap(Map map) {
    deserialize(map);
  }
}

class Lattice {

  // basis
  Vector2 v1, v2;
  // TODO matrix
  Matrix m;

  void reduceBasis() {
    if(isReduced()) return;

    // basically Euclid's GCD algorithm for vectors
    // from mit open courseware stuff
    // http://ocw.mit.edu/courses/mathematics/18-409-topics-in-theoretical-computer-science-an-algorithmists-toolkit-fall-2009/lecture-notes/MIT18_409F09_scribe19.pdf
    var v1length = v1.length;
    var v2length = v2.length;
    var exchange;

    if(v2length < v1length) {
      exchange = v2;
      v2 = v1;
      v1 = exchange;

      exchange = v2length;
      v2length = v1length;
      v1length = exchange;
    }

    while(!isReduced()) {

      // find factor to minimize v2 - factor*v1
      // TODO optimize
      var factor = 0;
      var lastLength = v2.length;
      var newLength;
      while((newLength = (v2 - v1*(factor+1)).length) < lastLength) {
        factor++;
        lastLength = newLength;
      }

      // set v2 = v2 - factor*v1
      v2 -= factor*v1;
      v2length = v2.length;

      // if |v2| <= |v1|, then done
      if(v1length < v2length) {
        break;
      }

      // swap v1 and v2
      exchange = v2;
      v2 = v1;
      v1 = exchange;

      exchange = v2length;
      v2length = v1length;
      v1length = exchange;
    }

    // TODO
    // recompute transformation matrix
    _computeMatrix();
  }

  void _computeMatrix() {
    // generate transformation matrix between lattice space and project space
    m = new Matrix(v1.x, v1.y, v2.x, v2.y, 0, 0);
  }

  bool isReduced() {
    return 2 * abs(v1*v2) <= v1.length2;
  }
  Vector2 getPoint(Vector2 coefs) {
    return m.transform(coefs);
  }
  Vector2 decompose(Vector2 point) {
    return m.inverseTransform(point);
  }
  Map closestTo(Vector2 point) {
    Vector2 closestCoefs = decompose(point).round();
    return {"point": getPoint(closestCoefs), "coefs": closestCoefs};
  }

  // TODO matrix doesn't actually need to be there because it's computed
  // in fact, it might be a good idea to make it a get property
  Map serialize() {
    return {"v1": v1.serialize(), "v2": v2.serialize, "m": m.serialize};
  }
  void deserialize(Map map) {
    v1.deserialize(map["v1"]);
    v2.deserialize(map["v2"]);
    m.deserialize(map["m"]);
  }
  Lattice.fromMap(Map map) {
    deserialize(map);
  }
}
