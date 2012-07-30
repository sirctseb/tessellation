#import("dart:html");
#import("../dart/Focus.dart");

void main() {
  
  var focus = new Focus(query("#header"), () => print("header lost focus"));

  // register handlers
  query("#register_button").on.click.add((event) {
    focus.register();
  });
  query("#unregister_button").on.click.add((event) {
    focus.unregister();
  });
}