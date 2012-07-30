/** [Tessellation] is the representation of a tessellation
 */

class Tessellation {
  
  // private fields
  List _polygons;
  List<Tessellation> _subgroups;
  List _transforms;
  Lattice _lattice;
  Tessellation _parent;
  
  // accessors to fields
  List get polygons() => _polygons;
  List<Tessellation> get subgroups() => _subgroups;
  List get transforms() => _transforms;
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
    _polygons = new List();
    _subgroups = new List();
    _transforms = new List();
    _lattice = new Lattice();
    _parent = null;
  }
}

class Lattice {
  Vecto
}
