#import('dart:html');
#import('FadeMenu.dart');
#import('BoxLid.dart');

void main() {
  new TessellationWebApp();
}

class TessellationWebApp {

	BoxLid _layout;
	FadeMenu _pathStyleMenu, _gridSettingMenu, _pointMenu, _keyPathMenu, _scaleMenu, _parameterizationMenu;

	TessellationWebApp() {
		// initialize web app
		_layout = new BoxLid(query(".boxlid-wrapper"));
		_pathStyleMenu = new FadeMenu(query("#pathstylecontainer"));
		_gridSettingMenu = new FadeMenu(query("#gridsettingcontainer"));
		_pointMenu = new FadeMenu(query("#pointcontainer"));
		_keyPathMenu = new FadeMenu(query("#keypathcontainer"));
		_scaleMenu = new FadeMenu(query("#scalecontainer"));
		_parameterizationMenu = new FadeMenu(query("#parameterizationcontainer"));
	}
}