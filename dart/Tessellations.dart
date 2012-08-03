class Tessellations {
  
  static Tessellation _PolyGroup44;
  static Tessellation get PolyGroup44() {
    initialize();
    return _PolyGroup44;
  }
  
  static bool _initialized = false; 
  static initialize() {
    if(!_initialized) {
      MakePolyGroup44();
      MakeGroupHex();
      MakeHitGroup();
      MakeHeartGroup();
      MakeKCGroup();
    }
  }

  static MakePolyGroup44() {
    _PolyGroup44 = new Tessellation.fromMap(
    {
      "polygons": [[
        new Vector2(0,0).serialize(),
        new Vector2(0,100).serialize(),
        new Vector2(100, 100).serialize(),
        new Vector2(100, 0).serialize()
      ]],
      "subgroups": [],
      "transforms": [
        new Matrix().serialize()
      ],
      "lattice": {
        "v1": new Vector2(0,100).serialize(),
        "v2": new Vector2(100,0).serialize(),
        "m": new Matrix().serialize()
      }
    });
  }
  static MakeGroupHex() {
    // TODO
  }
  static MakeHitGroup() {
    // TODO
  }
  static MakeHeartGroup() {
    // TODO
  }
  static MakeKCGroup() {
    // TODO
  }
}