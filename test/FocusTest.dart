#import("dart:html");
#import("../dart/Focus.dart");

void main() {
  var focus = new Focus(query("#header"), () => print("header lost focus"));
}