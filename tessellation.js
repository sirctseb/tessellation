var paper; // for jslint
var tessellation = (function() {
	
	// TODO define actual tessellation object
	
	var tessObject = {};
	tessObject.tileToPaper = function(point, tile) {
		// TODO ignoring translation for now
		return point.add(tile).multiply(100);
	};
	tessObject.init44 = function(options) {
		// store options
		this.options = options;
		
		// TODO create square grid lines and add to view
		var width = this.view.viewSize.width;
		var height = this.view.viewSize.height;
		
		// TODO should we do all this layer stuff in the app, and send it to tessellation?
		// save original active layer
		var origLayer = this.project.activeLayer;
		
		// create new layer for grid
		//var gridLayer = new this.paper.Layer();
		this.project.layers[options.gridLayer].activate();
		
		// create path for grid
		//var gridPath = new this.paper.Path([new this.paper.Point(0,1), new this.paper.Point(0,0), new this.paper.Point(1, 0)]);
		var gridPath = new this.paper.Path([new this.paper.Point(0,100), new this.paper.Point(0,0), new this.paper.Point(100, 0)]);
		gridPath.strokeColor = options.gridColor;
		gridPath.strokeWidth = 1;
		
		// create a symbol for the grid
		var gridSymbol = new this.paper.Symbol(gridPath);
		
		console.log("view.size: ", this.view.size.toString());
		console.log("view.bounds: ", this.view.bounds.toString());
		console.log("view.center: ", this.view.center.toString());
		console.log("view.bounds.center: " + this.view.bounds.center.toString());
		console.log("view bounds: ", this.view.bounds);
		
		
		// draw grid symbols in each tile
		var tileCenter = new this.paper.Point(0.505,0.505);
		for(var i = 0; i < width / 100; i++) {
			for(var j = 0; j < height / 100; j++) {
				//func(new paper.Point(i,j));
				gridSymbol.place(this.tileToPaper(tileCenter, new paper.Point(i,j)));
			}
		}
		
		// reactivate original layer
		origLayer.activate();
		
	};
	tessObject.addPath = function(path) {
		// TODO create symbol and place copies, put original back
		
		// select it
		path.selected = true;
		
		// store offset from zero
		var originalPosition = path.position.clone();
		// store offset from 0 to tile
		var tileOffset = this.tessellationToPaper(this.getTileAt(path.position));
		// store tile of new path
		var originalTile = this.getTileAt(path.position);
		
		// make symbol
		var newPathSymbol = new paper.Symbol(path);
		
		// TODO I think a paper.js bug: hittest tolerance grows when something is at (0,0)
		// move back to original position
		newPathSymbol.definition.position = newPathSymbol.definition.position.add(originalPosition);
		
		// select definition again
		path.selected = true;
		
		// put original back in the layer
		paper.project.layers[this.options.editLayer].addChild(path);
		
		// activate copy layer to put symbols in
		paper.project.layers[this.options.copyLayer].activate();
		
		// make group for layers
		var copyGroup = new paper.Group();
		//copyGroup.name = "path" + settings.newPathNumber;
		copyGroup.name = path.name;
		
		// increment new path number
		settings.newPathNumber++;
		
		// place symbols
		var zero = new paper.Point();
		overGrid(function(tile) {
			// if the original path isn't in this tile, place a symbol
			if(!tile.equals(originalTile)) {
				// get position of tile
				//var pos = tileToPaper(zero, tile);
				var pos = tessellationToPaper(tile).subtract(tessellationToPaper(originalTile));
				//var pos = tessellationToPaper(tile.subtract(originalTile));
				var placedSymbol = newPathSymbol.place(pos);
				// place symbol and put in group
				copyGroup.addChild(placedSymbol);
			}
		});
		
		// offset placed symbols by tile offset
		//copyGroup.translate(tileOffset.negate());
		
		lastSymbol = newPathSymbol;
		lastSymbolPoint = event.point;
		
		// activate edit layer
		paper.project.layers[settings.editLayer].activate();
	};
	tessObject.removePath = function() {
		// TODO anything?
	};
	tessObject.onResize = function() {
		// TODO recompute visible tiles & replace symbols
	};
	tessObject.onTranslate = function() {
		this.onResize();
	};
	tessObject.onZoom = function() {
		this.onResize();
	};
	tessObject.setOptions = function(options) {
		// TODO set options relating to symmetry, rotation, etc.
	};
	
	tessObject.getTileAt = function(point) {
		/*var canvasPoint = this.elementToCanvas(point);
		return new Point().setxy(Math.floor(canvasPoint.x / this.pathView.panelWidth),
								Math.floor(canvasPoint.y / this.pathView.panelHeight));*/
		/*return new paper.Point(Math.floor((point.x - grid.origin.x) / grid.scale),
								Math.floor((point.y - grid.origin.y) / grid.scale));*/
		/*return new paper.Point(Math.floor((point.x + this.view.bounds.x) * this.view.zoom / 100),
								Math.floor((point.y + this.view.bounds.y) * this.view.zoom / 100));*/
		return new paper.Point(Math.floor(point.x / 100),
								Math.floor(point.y / 100));
	};
	
	// convert between spaces
	tessObject.paperToTessellation = function(point) {
		//return point.subtract(grid.origin).multiply(1/grid.scale);
		//return point.multiply(100);
		return point;
	};
	tessObject.tessellationToPaper = function(point) {
		//return point.multiply(grid.scale).add(grid.origin);
		return point;
	};
	tessObject.tileToTessellation = function(point, tile) {
		return point.add(tile).multiply(100);
	};
	tessObject.tessellationToTile = function(point, tile) {
		return point.multiply(0.01).subtract(tile);
	};
	tessObject.tileToPaper = function(point, tile) {
		return this.tessellationToPaper(this.tileToTessellation(point,tile));
	};
	tessObject.paperToTile = function(point, tile) {
		return this.tessellationToTile(this.paperToTessellation(point), tile);
	};
	
	tessObject.setup = function(options) {
		// create a tessellation object
		var tess = Object.create(tessObject);
		// easy access to paperScope stuff
		tess.paper = paper;
		tess.view = paper.view;
		tess.project = paper.project;
		
		// setup based on options
		if(options.type == "{4,4}") {
			tess.type = options.type;
			tess.init44(options);
		}
		
		return tess;
	};
	
	return tessObject;
	
})();
