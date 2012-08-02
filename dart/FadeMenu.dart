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

  // create an element or add an existing one to the menu
  FadeMenuElement addElement([FadeMenuElement element = null]) {
    // create element if not supplied
    if(element == null) {
      element = new FadeMenuElement();
    }
    // add element to menu
    _root.nodes.add(element._root);
    // return the element
    return element;
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

    onSelect = null;
    onDeselect = null;
  }

  String  get header()            => _header.text;
          set header(String text) => _header.text = text;

  bool  get selected()          =>  _root.classes.contains("selected");
        set selected(bool sel)  =>  (sel && _selectable)
                                      ? _root.classes.add("selected")
                                      : _root.classes.remove("selected");

  // selection callbacks
  Function onSelect;
  Function onDeselect;

  // TODO unregister click handlers for selectable == false
  bool get selectable => _selectable;
  // make the section selectable or non-selectable
  bool set selectable(bool value) {
    _selectable = value;
    if(_selectable) {
      // register click handlers
      // TODO should callbacks be called if selection is changed via accessors?
      _header.on.click.add(_headerClickHandler);
    } else {
      _header.on.click.remove(_headerClickHandler);
    }
  }
  void _headerClickHandler(event) {
    // if currently selected
    if(this.selected) {
      // deselect
      this.selected = false;
      // call callback
      if(onSelect != null) onSelect();
      } else {
        // otherwise, select
        this.selected = true;
        // call callback
        if(onDeselect != null) onDeselect();
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
