/** [BoxLid] is a class to encapsulate the functionality
 * of the box-lid layout
 **/
#library("BoxLid");
#import("dart:html");

class BoxLid {
  // the root element of the boxlid layout
  Element root;
 
  // convenience accessors to panels
  Element get _leftPanel() => root.query(".boxlid-left-panel");
  Element get _rightPanel() => root.query(".boxlid-right-panel");
  Element get _topPanel() => root.query(".boxlid-top-panel");
  Element get _bottomPanel() => root.query(".boxlid-bottom-panel");
  Element get _centerPanel() => root.query(".boxlid-center");

  // the width or height of each panel
  int _left, _right, _top, _bottom;
  // the last width or height of each panel before it was closed
  int _openLeft, _openRight, _openTop, _openBottom;
  // the width or height of the panels when closed;
  int _closedSize;
  // mouse move handler storage
  Map<String, Function> _moveHandlers;

  // accessors for the widths and heights
  // setters automatically update dependent sizes
  int get left() => _left;
  int set left (value) {
    _left = value;
    // set sizes of elements
    _leftPanel.style.width = "${value}px";
    _bottomPanel.style.width = "${root.$dom_offsetWidth - value - 1}px";
    _setCenterSize();
  }
  int get top() => _top;
  int set top(value) {
    _top = value;
    // set sizes of elements
    _topPanel.style.height = "${value}px";
    _leftPanel.style.height = "${root.$dom_offsetWidth - value - 1}px";
    _setCenterSize();
  }
  int get bottom() => _botttom;
  int set bottom(value) {
    _bottom = value;
    // set sizes of elements
    _bottomPanel.style.height = "${value}px";
    _rightPanel.style.height = "${root.$dom_offsetHeight - value - 1}px";
    _setCenterSize();
  }
  int get right() => _right;
  int set right(value) {
    _right = value;
    // set sizes of elements
    _rightPanel.style.width = "${value}px";
    _topPanel.style.width = "${root.$dom_offsetWidth - value - 1}px";
    _setCenterSize();
  }

  /** Set the size of the center panel from the sizes of the side panels **/
  _setCenterSize() {
    int width = root.$dom_offsetWidth -
                  _leftPanel.$dom_offsetWidth -
                  _rightPanel.$dom_offsetWidth;
    int height = root.$dom_offsetHeight -
                  _topPanel.$dom_offsetHeight -
                  _bottomPanel.$dom_offsetHeight;
    _centerPanel.style.width = "${width}px";
    _centerPanel.style.height = "${height}px";
  }

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
    _bottomPanel.insertBefore(bottomHandle, _bottomPanel.nodes[0]);

    // update sizes
    //this.resize();
    left = _leftPanel.$dom_offsetWidth;
    right = _rightPanel.$dom_offsetWidth;

    // add interaction handlers
    // store move handler
    _moveHandlers = {
      "top": (event) => top = event.pageY - _topPanel.$dom_offsetTop,
      "left": (event) => left = event.pageX - _leftPanel.$dom_offsetLeft,
      "right": (event) => right = _rightPanel.offset().left + _rightPanel.width - event.pageX,
      "bottom": (event) => bottom = _bottomPanel.offset().top + _bottomPanel.height - event.pageY
    };
    topHandle.on.mouseDown.add((event) {
      // add move event
      root.on.mouseMove.add(_moveHandlers["top"]);
    });
    leftHandle.on.mouseDown.add((event) {
      root.on.mouseMove.add(_moveHandlers["left"]);
    });
    rightHandle.on.mouseDown.add((event) {
      root.on.mouseMove.add(_moveHandlers["right"]);
    });
    bottomHandle.on.mouseDown.add((event) {
      root.on.mouseMove.add(_moveHandlers["bottom"]);
    });
    
    // remove handlers on up
    root.on.mouseUp.add((event) {
      // remove move handler
      //root.on.mouseMove.remove(_moveHandlers["top"]);
      for(var handler in _moveHandlers.getValues()) {
        root.on.mouseMove.remove(handler);
      }
    });

    // click handles to open / close them
    leftHandle.on.click.add((event) {
      //if(_leftPanel.)
    });

  }
}