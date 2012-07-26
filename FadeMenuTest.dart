#import("dart:html");
#import("FadeMenu.dart");

void main() {
  queryAll(".fade-menu").forEach((element) => new FadeMenu(element));
  FadeMenu menu = new FadeMenu(query("#fade-menu-test"));
  var katsection = menu.addMenuSection("Katharina");
  var lname = katsection.addCollapsableMenuSection("Last Name");
  lname.addElement().root.text = "Ley";
  var sub = katsection.addCollapsableMenuSection("Something else");
  sub.addMenuSection("stuff");
}