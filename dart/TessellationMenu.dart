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
    _v1display = this.addElement(new FadeMenuVectorElement(lattice.v1, this, "v1"));
    _v2display = this.addElement(new FadeMenuVectorElement(lattice.v2, this, "v2"));
  }

  Lattice _lattice;
  Lattice get => _lattice;
  Lattice set lattice (Lattice value) {
    _lattice = value;

    // TODO update view
  }
}

class FadeMenuVectorElement {

  FadeMenuVectorElement(Vector2 vector, controller, String component) {
    _vector = vector;
    this.component = component;

    // initialize views
    root.classes.addAll(["${component}display", "vdisplay"]);

    // add default views

    // create edit button
    Element editButton = new Element.tag("div");
    editButton.classes.addAll(["editButton", "vdefault"]);
    editButton.text = "edit";
    // add click handler
    editButton.on.click.add((event) { editVector(vector); });
    root.nodes.add(editButton);

    // create text display
    Element textDisplay = new Element.tag("div");
    textDisplay.classes.addAll(["latticeVec", "vdefault"]);
    // TODO pretty print version
    textDisplay.text = vector.toString();
    // add click handler
    textDisplay.on.click.add((event) { beginEditLattice(vector); });
    root.nodes.add(textDisplay);


    // add editing views

    // create submit button
    Element submitButton = new Element.tag("div");
    submitButton.classes.addAll(["vecEditSubmit", "vedit"]);
    submitButton.text = "submit";
    submitButton.on.click.add((event) { finishEditVector(vector); });

    // create first label
    Element xLabel = new LabelElement();
    xLabel.classes.addAll(["vecEditLabel", "vedit"]);
    xLabel.text = "x: ";
    xLabel.htmlFor = "${component}xEdit";

    // create first text box
    Element xEdit = new InputElement("text");
    xEdit.classes.addAll(["vecEditField", "vedit"]);
    // TODO vector.toFixed(2);
    xEdit.value = vector.x.toString();
    xEdit.id = "${component}xEdit";


    // create second label
    Element yLabel = new LabelElement();
    yLabel.classes.addAll(["vecEditLabel", "vedit"]);
    yLabel.text = "y: ";
    yLabel.htmlFor = "${component}yEdit";

    // create second text box
    Element yEdit = new InputElement("text");
    yEdit.classes.addAll(["vecEditField", "vedit"]);
    // TODO vector.y.toFixed(2);
    yEdit.value = vector.y.toString();
    yEdit.id = "${component}yEdit";

    cancelEditVector();
  }

  Vector2 _vector;
  Vector2 get vector => _vector;
  Vector2 set vector(Vector2 value) {
    _vector = value;

    // update views when vectors are assigned
    updateFieldValues();
  }

  // either "v1" or "v2"
  String component;

  // inform the view that the vector value has changed
  void updateFieldValues() {
    List editBoxes = root.queryAll(".vecEditField");
    // TODO .toFixed(2);
    editBoxes[0].value = vector.x.toString();
    editBoxes[1].value = vector.y.toString();
  }

  void editVector() {
    // update fields because they aren't made fresh anymore
    updateFieldValues();

    // set edit mode on root
    // TODO do css for this: .vEditMode>.vedit {display:block}, etc.
    root.classes..remove("vDefaultMode")
                ..add("vEditMode");
    // notify controller
    controller.beginEditLattice(component);
  }

  void finishEditVector() {
    // TODO wrap in try for parsing values
    List values = root.queryAll(".vecEditField").map((input) => Math.parseDouble(input.value));
    controller.setLatticeValues({
      component: new Vector2(values[0], values[1]);
    });

    // put default displays back
    cancelEditVector();
  }
  void cancelEditVector() {
    root.classes..remove("vEditMode")
                ..add("vDefaultMode");
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