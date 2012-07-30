/** [TessellationMenu] is a class to represent the menu
  * on the left part of the screen
  **/
#library("TessellationMenu");
#import("dart:html");
#import("FadeMenu.dart");

class TessellationMenu {
  // TODO type declarations
  var _controller, _tessellation;
  FadeMenu _fadeMenu;

  TessellationMenu(options) {
    _controller = options.controller;
    _tessellation = options.tessellation;

    // init fade menu
    // TODO check options.suppressTopLevel?
    _fadeMenu = new FadeMenu();

    // add stamp section
    stampSection = _fadeMenu.addCollapsableMenuSection({"headerText": "Stamp"});

    // add lattice view
    // TODO this was htmlLatticeView before
    latticeSection = stampSection.addCollapsableMenuSection({"headerText": "Lattice"});
    // TODO ?
    //latticeSection.tessMenu "latticeView"

    // add polygon section
    polygonSection = stampSection.addCollapsableMenuSection(
      {"headerText": "Shapes (${_tessellation.polygons.length})"});

    // add substructure
    substampsection = stampSection.addCollapsableMenuSection(
      {"headerText": "Substamps (${_tessellation.subgroups.length})"});

    // add transform section
    transformSection = stampSection.addCollapsableMenuSection(
      {"headerText": "Placements (${_tessellation.transforms.length})"});

    // make stamp section selectable
    stampSection.selectable(true);

    // make polygon section selectable
    polygonSection.selectable(true);

    // add polygon info
    // TODO test this
    for(var polygon in tessellation.polygons) {
      // TODO these were htmlShapeViews before
      polygonSection.addCollapsableMenuSection(
        {"headerText": polygon.toString()});
    }

     // TODO add polygon entry

     // add substructure info
     // TOOD test this
     for(var subgroup in tessellation.subgroups) {
     	substampsection.
     }
  }
}