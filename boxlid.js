// a jquery plugin for a box lid type layout
(function($) {

	$.fn.boxlid = function(method) {
		var methods = {
			init: function(options) {
				var that = this;
				// initialize box lid layout

				// wrapper init
				this.addClass("boxlid-wrapper");

				// top panel init:
				// add the handle
				$(".boxlid-top-panel", this).append(
					$("<div></div>", {'class': 'boxlid-top-handle'})
				);

				// right panel:
				// add handle
				$(".boxlid-right-panel", this).append(
					$("<div></div>", {'class': 'boxlid-right-handle'})
				);

				// left panel:
				// add handle
				$(".boxlid-left-panel", this).append(
					$("<div></div>", {'class': 'boxlid-left-handle'})
				);

				// bottom panel:
				// add handle
				$(".boxlid-bottom-panel", this).prepend(
					$("<div></div>", {'class': 'boxlid-bottom-handle'})
				);

				this.boxlid("resize");

				// add interaction handlers
				var toppanel = $(".boxlid-top-panel", this);
				var leftpanel = $(".boxlid-left-panel", this);
				var rightpanel = $(".boxlid-right-panel", this);
				var bottompanel = $(".boxlid-bottom-panel", this);

				// top handle drag
				$(".boxlid-top-handle", that).mousedown(function(event) {
					$("body").on("mousemove.boxlid", function(event) {

						// resize to set top height
						that.boxlid('resize', {top: {height: event.pageY - toppanel.offset().top}});

						return false;
					});
				});
				// left handle drag
				$(".boxlid-left-handle", that).mousedown(function(event) {
					$("body").on("mousemove.boxlid", function(event) {

						// resize to set left width
						that.boxlid('resize', {left: {width: event.pageX - leftpanel.offset().left}});

						return false;
					});
				});
				// right handle drag
				$(".boxlid-right-handle", that).mousedown(function(event) {
					$("body").on("mousemove.boxlid", function(event) {

						// resize to set right width
						that.boxlid('resize', {right: {width: rightpanel.offset().left + rightpanel.width() - event.pageX}});

						return false;
					});
				});
				// bottom handle drag
				$(".boxlid-bottom-handle", that).mousedown(function(event) {
					$("body").on("mousemove.boxlid", function(event) {
						// resize to set bottom height
						that.boxlid('resize', {bottom: {height: bottompanel.offset().top + bottompanel.height() - event.pageY}});

						return false;
					})
				})

				// up handlers
				$("body").mouseup(function(event) {
					$("body").off("mousemove.boxlid");
					log.log('taking mouse move off, because up', 'handle');
				});

				// resize handler
				this.on('resize.boxlid', function(event) {
					log.log('resizing', 'handle');
					this.boxlid('resize');
				});

				// resize to supplied sizes if they exist
				if(options) {
					this.boxlid('resize', options);
				}
			},
			// set the sizes of one or more of the panels by any css or pixel integer, and
			// pixelize the resulting sizes and fill the container area
			// options = {side: {dimension: size, +}, +}
			// where	side = (top | right | left | bottom)
			//			dimension = (width | height)
			resize: function(options) {
				log.log('resizing', 'handle');
				var that = this;

				// set sizes from options if supplied
				var opposites = {top: {height: 'left',
								 		width: 'right'},
								right: {height: 'bottom',
										width: 'top'},
								left: {height: 'top',
										width: 'bottom'},
								bottom: {height: 'right',
										width: 'left'}
								};
				if(options) {
					$.each(options, function(side, val) {
						$.each(val, function(dimension, size) {
							// set css width or height
							// allow css string or integer number of pixels
							$(".boxlid-" + side + "-panel", that).css(dimension, typeof size === 'string' ? size : size + 'px');
							// set width or height of opposite side
							$(".boxlid-" + opposites[side][dimension] + "-panel", that)
								.css(dimension, that[dimension]() - $(".boxlid-" + side + "-panel", that)[dimension]());
						});
					});
				}
				this.boxlid('pixelizeSizes');
			},
			// force all sizes to be set in pixels and to fill the area of the container
			pixelizeSizes: function() {
				// force all to be in pixels

				// set sizes in pixels
				// set width in pixels for top and left
				$(".boxlid-top-panel, .boxlid-left-panel", this).width(function(index, width) {
					return width;
				});
				// set width in pixels for right and bottom
				$(".boxlid-right-panel", this).width(this.width() - $(".boxlid-top-panel").width() - 1);
				$(".boxlid-bottom-panel", this).width(this.width() - $(".boxlid-left-panel").width() - 1);

				// set height in pixels for top and right
				$(".boxlid-top-panel, .boxlid-right-panel", this).height(function(index, height) {
					return height;
				});
				// set height in pixels for left and bottom
				$(".boxlid-left-panel", this).height(this.height() - $(".boxlid-top-panel").height() - 1);
				$(".boxlid-bottom-panel", this).height(this.height() - $(".boxlid-right-panel").height() - 1);
			},
			// force a height or width of a panel to be specified in pixels at it's current size or a supplied size
			// options.dimension = ('width' | 'height' | undefined)					both are set to current size if undefined
			// options.panel = ('top' | 'right' | 'left' | 'bottom' | undefined)	all are set if undefined
			// options.css = ({width: css-value} | {height: css-value} | undefined)	set to current size if undefined
			size: function(options) {
				var that = this;
				// set to supplied size, if given
				if(options.css) {
					$(".boxlid-" + options.panel + "-panel", this).css(options.css);
				}
				options.panel = options.panel ? [options.panel] : ['top', 'right', 'left', 'bottom'];
				options.dimension = options.dimension ? [options.dimension] : ['width', 'height'];
				$.each(options.panel, function(panel) {
					$.each(options.dimension, function(dimension) {
						// force pixels
						$(".boxlid-" + options.panel + "-panel", this)[options.dimension](
							$(".boxlid-" + options.panel + "-panel",this)[options.dimension]()
						);
					});
				});
			}
		};

		if(methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if(typeof method == 'object' || ! method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.cake');
		}

	    return this;
	}

})(jQuery);