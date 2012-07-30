
#import('dart:html');
#import('FadeMenu.dart');
#import('BoxLid.dart');

num rotatePos = 0;

void main() {
  queryAll(".fade-menu").forEach((menu) => new FadeMenu(menu));
  new BoxLid(query(".boxlid-wrapper"));
}

void rotateText(Event event) {
  rotatePos += 360;

  var textElement = query("#text");

  textElement.style.transition = "1s";
  textElement.style.transform = "rotate(${rotatePos}deg)";
}
