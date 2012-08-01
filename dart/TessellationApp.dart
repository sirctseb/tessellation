
#import('dart:html');
#import('FadeMenu.dart');
#import('BoxLid.dart');

void main() {
  queryAll(".fade-menu").forEach((menu) => new FadeMenu(menu));
  new BoxLid(query(".boxlid-wrapper"));
}