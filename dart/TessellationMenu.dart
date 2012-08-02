/** [TessellationMenu] is a class to represent the menu
  * on the left part of the screen
  **/
#library("TessellationMenu");
#import("dart:html");
#import("FadeMenu.dart");
#import("Tessellation.dart");

class TessellationMenu {
  // TODO type declarations
  TessellationApp _controller;
  Tessellation _tessellation;
  FadeMenu _fadeMenu;

  TessellationMenu(options) {
    _controller = options.controller;
    _tessellation = options.tessellation;

    // init fade menu
    // TODO check options.suppressTopLevel?
    _fadeMenu = new FadeMenu();

    // add stamp section
    stampSection = _fadeMenu.addElement(new FadeMenuCollapsableSection("Stamp"));

    // add lattice view
    // TODO this was htmlLatticeView before
    latticeSection = stampSection.addElement(new FadeMenuCollapsableSection("Lattice");
    // TODO ?
    //latticeSection.tessMenu "latticeView"

    // add polygon section
    polygonSection = stampSection.addElement(
      new FadeMenuCollapsableSection("Shapes (${_tessellation.polygons.length})");

    // add substructure
    substampsection = stampSection.addElement(
      new FadeMenuCollapsableSection("Substamps (${_tessellation.subgroups.length})");

    // add transform section
    transformSection = stampSection.addElement(
      new FadeMenuCollapsableSection("Placements (${_tessellation.transforms.length})");

    // make stamp section selectable
    stampSection.selectable = true;

    // make polygon section selectable
    polygonSection.selectable = true;

    // add polygon info
    // TODO test this
    for(var polygon in tessellation.polygons) {
      // TODO these were htmlShapeViews before
      polygonSection.addElement(new FadeMenuShapeSection(polygon));
    }

     // TODO add polygon entry

     // add substructure info
     // TOOD test this
     for(var subgroup in tessellation.subgroups) {
     	substampsection.
     }
  }
}

/** [FadeMenuLatticeSection] is a custom [FadeMenuCollapsableSection] for
  * viewing information about a [Lattice] of a [Tessellation]
  */
class FadeMenuLatticeSection {

  FadeMenuLatticeSection(Lattice lattice) {
    _lattice = lattice;

    // create sub elements
    _v1display = this.addElement();
    _v2display = this.addElement();

    // initialize sub elements
    _v1display.root.classes.addAll(["v1display", "vdisplay"]);
    _v2display.root.classes.addAll(["v2display", "vdisplay"]);
  }

  Lattice _lattice;
  Lattice get => _lattice;
  Lattice set lattice (Lattice value) {
    _lattice = value;

    // TODO update view
  }
}

class FadeMenuVectorElement {

  FadeMenuVectorElement(Vector2 vector, controller) {
    _vector = vector;

    // initialize views

    // add default views

    // create edit button
    Element editButton = new Element.tag("div");
    editButton.classes.addAll(["editButton", "vdefault"]);
    editButton.text = "edit";
    // add click handler
    editButton.on.click.add((event) { controller.editVector(vector); });
    root.nodes.add(editButton);

    // create text display
    Element textDisplay = new Element.tag("div");
    textDisplay.classes.addAll(["latticeVec", "vdefault"]);
    // TODO pretty print version
    textDisplay.text = vector.toString();
    // add click handler
    textDisplay.on.click.add((event) { controller.beginEditLattice(vector); });
    root.nodes.add(textDisplay);


    // add editing views

    // create submit button
    Element submitButton = new Element.tag("div");
    submitButton.classes.addAll(["vecEditSubmit", "vedit"]);
    submitButton.text = "submit";
    submitButton.on.click.add((event) { controller.finishEditVector(vector); });

    // create first label
    Element xLabel = new Element.tag("div");
    xlabel
  }

  Vector2 _vector;
  Vector2 get vector => _vector;
  Vector2 set vector(Vector2 value) {
    _vector = value;

    // TODO update view
  }
}

/** [FadeMenuShapeSection] is a custom [FadeMenuCollapsableSection] for
  * displaying information about polygons in a [Tessellation]
  */
class FadeMenuShapeSection {
  // the polygon of the view
  var _polygon;

  Object get polygon => _polygon;

  Object set polygon(poly) {
    _polygon = poly;

    // TODO update view
  }

  // path views
  List _pathViews;

  FadeMenuShapeSection(polygon) : super(polygon.toString()) {
    _polygon = polygon;
    _pathViews = new List();
  }

  // add user-drawn content to the view
  void addContent(path) {
    FadeMenuElement pathView = this.addElement();
    pathView.text = path.toString();
  }
}

// TODO need a class for a section with a paperjs canvas for shape view and path views