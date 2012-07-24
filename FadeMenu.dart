/** FadeMenu is a really cool looking menu
 */
#library("FadeMenu");
#import("dart:html");

class FadeMenuElement {
  Element root;
  FadeMenuElement(options) {
    root = new Element.tag(options.type || "div");
    // add element class
    root.classes.add("fade-menu-element");
    // add contents
    root.nodes.add(options.contents);
    // TODO should FadeMenuSection extend this if we have this contents thing?
  }
}

class FadeMenuSection extends FadeMenuElement{
  Element _header;
  Element get header()            => _header.text;
          set header(String text) => _header.text = text;
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

class FadeMenu {
  Element root;
  
  // TODO make factory that checks if an FM has already been constructed
  // for this element and return it from a cache if so
  FadeMenu(Element element) {
    // TODO check that it hasn't already been initialized as a fade menu?
    root = element;
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
  
  // create a section and add it to the menu
  Element addMenuSection(options) {
    FadeMenuSection section = new FadeMenuSection(options);
    // add element to menu
    root.nodes.add(section.root);
    // return the element
    return section;
  }
  
  // create a collapsable section and add it to the menu
  Element addCollapsableMenuSection(options) {

    FadeMenuCollapsableSection section = new FadeMenuCollapsableSection(options);
    // add element to menu
    root.nodes.add(section.root);
    // return the element
    return section;
  }

  // create a fade menu element and add it to the menu
  Element addElement(options) {
    // create element
    FadeMenuElement element = new FadeMenuElement(options);
    // add element to menu
    root.nodes.add(element.root);
    // return the element
    return element;
  }

  // return an element at a given index
  Element getElement(index) {
    return nodes[index];
  }
}
