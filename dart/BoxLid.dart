/** [BoxLid] is a class to encapsulate the functionality
 * of the box-lid layout
 **/
#library("BoxLid");
#import("dart:html");

class BoxLid {
  Element root;
  int _left, _right, _top, _bottom;
  int get left => return _left;
  int set left (value) {
    _left = value;
    // TODO set other sizes
  }
  // TODO setters

  BoxLid(Element element) {
    root = element;
    // add wrapper class
    root.classes.add("boxlid-wrapper");

    // top panel init:
    // add the handle
    Element topHandle = new Element.tag("div");
    topHandle.classes.add("boxlid-top-handle");
    root.query(".boxlid-top-panel").nodes.add(topHandle);

    // right panel:
    // add handle
    Element rightHandle = new Element.tag("div");
    rightHandle.classes.add("boxlid-right-handle");
    root.query(".boxlid-right-panel").nodes.add(rightHandle);

    // left panel:
    // add handle
    Element leftHandle = new Element.tag("div");
    leftHandle.classes.add("boxlid-left-handle");
    root.query(".boxlid-left-panel").nodes.add(leftHandle);

    // bottom panel
    // add handle
    Element bottomHandle = new Element.tag("div");
    bottomHandle.classes.add("boxlid-bottom-handle");
    root.query(".boxlid-left-panel").insertRange(0,1,bottomHandle);

    // update sizes
    this.resize();

    // add interaction handlers
    topHandle.on.drag.add((event) {
      this.top = event.pageY - this.topPanel.offset().top;
    });
  }
}