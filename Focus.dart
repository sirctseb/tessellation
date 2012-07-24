/** [Focus] is a class to allow elements to know when they
 *	have lost focus, that is, when a click occurs outside their bounds
 **/

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
  final static List<Focus> registrants = new List<Focus>();
  // Register a new element
  static register(Focus focus) {
    registrants.add(focus);
  }
  // TODO unregister?
  // Initialize monitoring
  static Init() {
    // add click handler to document
    document.on.click.add((event) {
      // for each registrant,
      registrants.forEach((focus) {
        // if click is outside element, call callback
        if(!focus.element.contains(event.target)) registrant.callback();
      });
    });
  }
}