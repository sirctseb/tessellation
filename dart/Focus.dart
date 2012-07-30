/** [Focus] is a class to allow elements to know when they
 *	have lost focus, that is, when a click occurs outside their bounds
 **/
 #library("Focus");
 #import("dart:html");

class Focus implements Hashable {
  // The element to watch for loss of focus
  Element element;
  // The function to be called when focus is lost
  var callback;

  Focus(this.element, this.callback) {
    // lazy initialize
    Init();
    
    // register
    register();
  }
  
  // Hashable implementation
  // TODO is this a reasonable hash?
  int hashCode() {
    return "${element.toString()}${callback.toString()}".hashCode();
  }

  // The list of Focus instances watching for focus loss
  static Set _registrants;
  // Register a new element
  void register() {
    _registrants.add(this);
  }
  // Unregister an element
  void unregister() {
    _registrants.remove(this);
  }
  // TODO unregister?
  // Initialize monitoring
  static Init() {
    if(_registrants != null) return;
    _registrants = new Set();
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