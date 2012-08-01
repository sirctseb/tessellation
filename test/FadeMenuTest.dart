#import("dart:html");
#import("../dart/FadeMenu.dart");

void main() {
  queryAll(".fade-menu").forEach((element) => new FadeMenu(element));
  FadeMenu menu = new FadeMenu(query("#fade-menu-test"));
  var katsection = menu.addElement(new FadeMenuSection("Katharina");
  var lname = katsection.addElement(new FadeMenuCollapsableSection("Last Name"));
  lname.addElement().root.text = "Ley";
  var sub = katsection.addElement(new FadeMenuCollapsableSection("Something else"));
  sub.addElement(new FadeMenuSection("stuff"));
}