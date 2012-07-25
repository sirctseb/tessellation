#import("dart:html");
#import("FadeMenu.dart");

void main() {
  queryAll(".fade-menu").forEach((element) => new FadeMenu(element));
  //FadeMenu menu = new FadeMenu(query("#fade-menu-test"));  
}