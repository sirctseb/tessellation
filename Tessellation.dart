
#import('dart:html');
#import('FadeMenu.dart');

num rotatePos = 0;

void main() {
  //queryAll(".fade-menu").forEach((el) => new FadeMenu(el));
  new FadeMenu(query(".fade-menu"));
  FadeMenu menu = new FadeMenu(query("#test-fade-menu"));
  //menu.addMenuSection();
  //query("#text").text = "Welcome to Dart!";

  //query("#text").on.click.add(rotateText);
}

void rotateText(Event event) {
  rotatePos += 360;

  var textElement = query("#text");

  textElement.style.transition = "1s";
  textElement.style.transform = "rotate(${rotatePos}deg)";
}
