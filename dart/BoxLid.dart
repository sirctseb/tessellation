/** [BoxLid] is a class to encapsulate the functionality
 * of the box-lid layout
 **/
#library("BoxLid");
#import("dart:html");

class BoxLid {
  // the root element of the boxlid layout
  Element root;
 
  // convenience accessors to panels
  Element get _leftPanel => root.query(".boxlid-left-panel");
  Element get _rightPanel => root.query(".boxlid-right-panel");
  Element get _topPanel => root.query(".boxlid-top-panel");
  Element get _bottomPanel => root.query(".boxlid-bottom-panel");
  Element get _centerPanel => root.query(".boxlid-center");

  // the width or height of each panel
  int _left, _right, _top, _bottom;
  // the last width or height of each panel before it was closed
  int _openLeft, _openRight, _openTop, _openBottom;
  // the width or height of the panels when closed;
  int _closedSize;

  // accessors for the widths and heights
  // setters automatically update dependent sizes
  int get left => _left;
  int set left (value) {
    _left = value;
    // set sizes of elements
    _leftPanel.style.width = "${value}px";
    _bottomPanel.style.width = "${root.style.height.parseInt() - value}px";
    _setCenterSize();
  }
  int get top => _top;
  int set top(value) {
    _top = value;
    // set sizes of elements
    root.query(".boxlid-top-panel").style.height = "${value}px";
    root.query(".boxlid-left-panel").style.height = "${root.style.height.parseInt() - value}px";
    _setCenterSize();
  }
  int get bottom => _botttom;
  int set bottom(value) {
    _bottom = value;
    // set sizes of elements
    _bottomPanel.style.height = "${value}px";
    _rightPanel.style.height = "${root.style.height.parseInt() - value}px";
    _setCenterSize();
  }
  int get right => _right;
  int set right(value) {
    _right = value;
    // set sizes of elements
    _rightPanel.style.width = "${value}px";
    _topPanel.style.width = "${root.style.width.parseInt() - value}px";
    _setCenterSize();
  }

  /** Set the size of the center panel from the sizes of the side panels **/
  _setCenterSize() {
    int width = root.style.width.parseInt() -
                  root.query(".boxlid-left-panel").style.width.parseInt() -
                  _rightPanel.style.width.parseInt();
    int height = root.style.height.parseInt() -
                  _topPanel.style.height.parseInt() -
                  _bottomPanel.style.height.parseInt();
    _centerPanel.style.width = "${width}px";
    _centerPanel.style.height = "${height}px";
  }
  // TODO setters

  BoxLid(Element element) {
    _closedSize = 10;
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
      this.top = event.pageY - this._topPanel.offset().top;
    });

    leftHandle.on.drag.add((event) {
      this.left = event.pageX - this._leftPanel.offset().left;
    });

    rightHandle.on.drag.add((event) {
      this.right = _rightPanel.offset().left + _rightPanel.width - event.pageX;
    });

    bottomHandle.on.drag.add((event) {
      this.bottom = _bottomPanel.offset().top + _bottomPanel.height - event.pageY;
    });

    // click handles to open / close them
    leftHandle.on.click.add((event) {
      //if(_leftPanel.)
    })

  }
}