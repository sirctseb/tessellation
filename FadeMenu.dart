/** FadeMenu is a really cool looking menu
 */
#library("FadeMenu");
#import("dart:html");

class FadeMenuElement {
  Element root;
  FadeMenuElement() {
    root = new Element.tag("div");
    // add element class
    root.classes.add("fade-menu-element");
    // TODO should FadeMenuSection extend this if we have this contents thing?
  }
  FadeMenuElement.fromElement(Element element) {
    root = element;
    // add element class
    root.classes.add("fade-menu-element");
  }

  // TODO need to refactor because sections need these methods

  // create a section and add it to the menu
  FadeMenuSection addMenuSection(options) {
    FadeMenuSection section = new FadeMenuSection(options);
    // add element to menu
    root.nodes.add(section.root);
    // return the element
    return section;
  }
  
  // create a collapsable section and add it to the menu
  FadeMenuCollapsableSection addCollapsableMenuSection(options) {

    FadeMenuCollapsableSection section = new FadeMenuCollapsableSection(options);
    // add element to menu
    root.nodes.add(section.root);
    // return the element
      return section;
    }

    // create a fade menu element and add it to the menu
    FadeMenuElement addElement(options) {
    // create element
    FadeMenuElement element = new FadeMenuElement(options);
    // add element to menu
    root.nodes.add(element.root);
    // return the element
    return element;
  }
}

class FadeMenuSection extends FadeMenuElement{
  Element _header;
  bool _selectable = false;
  FadeMenuSection(options) : super(options) {
    // add classes from options
    if(options.classes) {
      options.classes.forEach((cls) => element.classes.add(cls));
    }
    // add fade menu section class
    root.classes.add("fade-menu-section");
    // create header
    _header = new Element.tag("div");
    // add header class
    _header.classes.add("fade-menu-section-title");
    // add text
    _header.text = options.headerText;
    // add header
    root.nodes.add(_header);
  }

  Element get header()            => _header.text;
          set header(String text) => _header.text = text;

  bool  get selected()          =>  root.classes.contains("selected");
        set selected(bool sel)  =>  (sel && _selectable)
                                      ? root.classes.add("selected")
                                      : root.classes.remove("selected");
  // TODO a better interface might be public properties for callbacks,
  // and getter/setter for selectable

  // selection callbacks
  var _onSelect = null;
  var _onDeselect = null;
  // TODO unregister click handlers for selectable == false
  // make the section selectable or non-selectable
  setSelectable(bool selectable, [callbacks]) {
    // set callbacks if supplied
    _onSelect = callbacks["onSelect"];
    _onDeselect = callbacks["onDeselect"];
    if(selectable) {
      // register click handlers
      // TODO should callbacks be called if selection is changed via accessors?
      _header.on.click.add((event) {
        // if currently selected
        if(this.selected) {
          // deselect
          this.selected = false;
          // call callback
          if(_onSelect != null) _onSelect();
        } else {
          // otherwise, select
          this.selected = true;
          // call callback
          if(_onDeselect != null) _onDeselect();
        }
      });
    }
  }
}

class FadeMenuCollapsableSection extends FadeMenuSection {
  FadeMenuCollapsableSection(options) : super(options) {
    // add collapsable menu section class
    root.classes.add("fade-menu-collapsable-section");
    // create collapse arrow
    Element arrow = new Element.tag("div");
    arrow.classes.add("fade-menu-collapse-arrow");
    // add arrow
    root.nodes.insertBefore(arrow, _header);
  }
}

class FadeMenu extends FadeMenuElement {
  
  // TODO make factory that checks if an FM has already been constructed
  // for this element and return it from a cache if so
  FadeMenu(Element element) : super.fromElement(element) {
    // Add fade-menu class
    root.classes.add("fade-menu");
    // register click handlers for collapsable sections
    root.queryAll(".fade-menu-collapsable-section").forEach((el) {
      el.on.click.add((event) {
        // toggle collapsed class
        if(el.classes.contains("collapsed")) {
          el.classes.remove("collapsed");
        } else {
          el.classes.add("collapsed");
        }
        event.stopPropagation();
        });
    });
  }

  // return an element at a given index
  Element getElement(index) {
    return nodes[index];
  }
}
