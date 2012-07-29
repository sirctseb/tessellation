/** [Focus] is a class to allow elements to know when they
 *	have lost focus, that is, when a click occurs outside their bounds
 **/
 #library("Focus");
 #import("dart:html");

class Focus {
  // The element to watch for loss of focus
  Element element;
  // The function to be called when focus is lost
  var callback;

  Focus(this.element, this.callback) {
    // register
    register(this);
  }

  // The list of Focus instances watching for focus loss
  static List<Focus> _registrants;
  // Register a new element
  static register(Focus focus) {
    if(_registrants == null) {
      _registrants = new List<Focus>();
      // lazy initialize
      Init();
    }
    _registrants.add(focus);
  }
  // TODO unregister?
  // Initialize monitoring
  static Init() {
    // add click handler to document
    // TODO mouse down instead of click?
    document.on.click.add((event) {
      // for each registrant,
      _registrants.forEach((focus) {
        // if click is outside element, call callback
        if(!focus.element.contains(event.target)) focus.callback();
      });
    });
  }
}