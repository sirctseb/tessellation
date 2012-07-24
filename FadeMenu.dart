/** FadeMenu is a really cool looking menu
 */
#library("FadeMenu");
#import("dart:html");

class FadeMenu {
  Element _root;
  
  FadeMenu(Element element) {
    _root = element;
    // Add fade-menu class
    _root.classes.add("fade-menu");
    print(_root.classes);
    // register click handlers for collapsable sections
    _root.queryAll(".fade-menu-collapsable-section").forEach((el) {
        el.on.click.add((event) {
            if(el.classes.contains("collapsed")) {
              el.classes.remove("collapsed");
            } else {
              el.classes.add("collapsed");
            }
            event.stopPropagation();
        });
    });
  }
  
}
