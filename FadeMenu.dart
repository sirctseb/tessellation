/** FadeMenu is a really cool looking menu
 */
#library("FadeMenu");
#import("dart:html");

class FadeMenu {
  Element root;
  
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
    // TODO test that this is a menu or section
    Element element = new Element.tag(options.type || "div");
    // add classes from options
    if(options.classes) {
      options.classes.forEach((cls) => element.classes.add(cls));
    }
    // add fade menu section class
    element.classes.add("fade-menu-section");
    // create header
    Element header = new Element.tag("div");
    // add header class
    header.classes.add("fade-menu-section-title");
    // add text
    header.text = options.headerText;
    // add header
    element.nodes.add(header);
    // add element to menu
    _root.nodes.add(element);
    // return the element
    return element;
  }
  
  // create a collapsable section and add it to the menu
  Element addCollapsableMenuSection(options) {
    // TODO test that this is a menu or section
    // create the element
    Element element = new Element.tag(options.type || "div");
    // add classes from options
    if(options.classes) {
      options.classes.forEach((cls) => element.classes.add(cls));
    }
    // add collapsable menu section class
    element.classes.add("fade-menu-collapsable-section");
    // create collapse arrow
    Element arrow = new Element.tag("div");
    arrow.classes.add("fade-menu-collapse-arrow");
    // add arrow
    element.nodes.add(arrow);
    // create header
    Element header = new Element.tag("div");
    header.classes.add("fade-menu-section-title");
    header.text = options.headerText;
    // add header
    element.nodes.add(header);
    // add element to menu
    _root.nodes.add(element);
    // return the element
    return element;
  }

  // create a fade menu element and add it to the menu
  Element addElement(options) {
    // TODO test that this is a menu or section
    // create element
    Element element = new Element.tag(options.type || "div");
    // add element class
    element.classes.add("fade-menu-element");
    // add contents
    element.nodes.add(options.contents);
    // add element to menu
    _root.nodes.add(element);
    // return the element
    return element;
  }

  // return an element at a given index
  Element getElement(index) {
    return nodes[index];
  }
}
