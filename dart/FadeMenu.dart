/** FadeMenu is a really cool looking menu
 */
#library("FadeMenu");
#import("dart:html");

class FadeMenuElement {
  Element _root;
  Element get root() => _root;
  FadeMenuElement() {
    _root = new Element.tag("div");
    // add element class
    _root.classes.add("fade-menu-element");
  }
  FadeMenuElement.fromElement(Element element) {
    _root = element;
    // add element class
    _root.classes.add("fade-menu-element");
  }

  // TODO need to refactor because sections need these methods

  // create a section and add it to the menu
  FadeMenuSection addMenuSection([String headerText = ""]) {
    FadeMenuSection section = new FadeMenuSection(headerText);
    // add element to menu
    _root.nodes.add(section._root);
    // return the element
    return section;
  }
  
  // create a collapsable section and add it to the menu
  FadeMenuCollapsableSection addCollapsableMenuSection([String headerText = ""]) {

    FadeMenuCollapsableSection section = new FadeMenuCollapsableSection(headerText);
    // add element to menu
    _root.nodes.add(section._root);
    // return the element
      return section;
  }

  // create a fade menu element and add it to the menu
  FadeMenuElement addElement() {
    // create element
    FadeMenuElement menuElement = new FadeMenuElement();
    // add element to menu
    _root.nodes.add(menuElement._root);
    // return the element
    return menuElement;
  }
}

class FadeMenuSection extends FadeMenuElement{
  Element _header;
  bool _selectable = false;
  FadeMenuSection([String headerText = ""]) {
    // add fade menu section class
    _root.classes.add("fade-menu-section");
    // create header
    _header = new Element.tag("div");
    // add header class
    _header.classes.add("fade-menu-section-title");
    // add text
    _header.text = headerText;
    // add header
    _root.nodes.add(_header);
  }

  String  get header()            => _header.text;
          set header(String text) => _header.text = text;

  bool  get selected()          =>  _root.classes.contains("selected");
        set selected(bool sel)  =>  (sel && _selectable)
                                      ? _root.classes.add("selected")
                                      : _root.classes.remove("selected");
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
  FadeMenuCollapsableSection([String headerText = ""]) : super(headerText) {
    // add collapsable menu section class
    _root.classes.add("fade-menu-collapsable-section");
    // create collapse arrow
    Element arrow = new Element.tag("div");
    arrow.classes.add("fade-menu-collapse-arrow");
    // add arrow
    _root.insertBefore(arrow, _header);
    // add click handler
    arrow.on.click.add((event) {
      // toggle collapsed class
      if(arrow.parent.classes.contains("collapsed")) {
        arrow.parent.classes.remove("collapsed");
      } else {
        arrow.parent.classes.add("collapsed");
      }
      event.stopPropagation();
    });
  }
}

class FadeMenu extends FadeMenuElement {
  
  // TODO make factory that checks if an FM has already been constructed
  // for this element and return it from a cache if so
  FadeMenu(Element element) : super.fromElement(element) {
    // Add fade-menu class
    _root.classes.add("fade-menu");
    // register click handlers for collapsable sections
    _root.queryAll(".fade-menu-collapse-arrow").forEach((Element el) {
      el.on.click.add((event) {
        // toggle collapsed class
        if(el.parent.classes.contains("collapsed")) {
          el.parent.classes.remove("collapsed");
        } else {
          el.parent.classes.add("collapsed");
        }
        event.stopPropagation();
      });
    });
  }

  // return an element at a given index
  Element getElement(index) {
    return _root.nodes[index];
  }
}