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
				// wrap contents of top panel in the content wrapper
				$(".boxlid-top-panel", this).wrapInner(
					$("<div></div>", {'class': 'boxlid-top-content'})
				)
				// add the handle
				.append(
					$("<div></div>", {'class': 'boxlid-handle boxlid-hor-handle boxlid-top-handle'})
				);

				// right panel:
				// add handle
				$(".boxlid-right-panel", this).append(
					$("<div></div>", {'class': 'boxlid-handle boxlid-vert-handle boxlid-right-handle'})
				);

				// left panel:
				// add handle
				$(".boxlid-left-panel", this).append(
					$("<div></div>", {'class': 'boxlid-handle boxlid-vert-handle boxlid-left-handle'})
				);

				// bottom panel:
				// add handle
				$(".boxlid-bottom-panel", this).prepend(
					$("<div></div>", {'class': 'boxlid-handle boxlid-hor-handle boxlid-bottom-handle'})
				);

				// set sizes in pixels
				// set width in pixels for top and left
				$(".boxlid-top-panel, .boxlid-left-panel", this).width(function(index, width) {
					return width;
				});
				// set width in pixels for right and bottom
				$(".boxlid-right-panel", this).width(this.width() - $(".boxlid-top-panel").width());
				$(".boxlid-bottom-panel", this).width(this.width() - $(".boxlid-left-panel").width());

				// set height in pixels for top and right
				$(".boxlid-top-panel, .boxlid-left-panel", this).height(function(index, height) {
					return height;
				});
				// set height in pixels for left and bottom
				$(".boxlid-left-panel", this).height(this.height() - $(".boxlid-top-panel").height());
				$(".boxlid-bottom-panel", this).height(this.height() - $(".boxlid-right-panel").height());

				// TODO show handle image in handle on mouse over
				//log.log('putting mouse move on', 'handle');
				/*$(".boxlid-top-handle", this).on("mousemove.boxlid", 
				})
				// disable until mousedow
				.off("mousemove.boxlid");*/
				//log.log('took mouse move off', 'handle');

				// add interaction handlers
				$(".boxlid-top-handle", that).mousedown(function(event) {
					$("body").on("mousemove.boxlid", function(event) {
						// TODO dragging stuff

						// get top panel
						toppanel = $(".boxlid-top-panel", $(this).parent().parent());

						// set new height of top panel
						//log.log(event.pageY - $(this).offset().top, 'handle');
						toppanel.height(event.pageY - toppanel.offset().top);

						// set new height of left panel
						$(".boxlid-left-panel", toppanel.parent()).height(toppanel.parent().height() - toppanel.height());

						log.log('mouse moved', 'handle');
					});
					log.log('putting mouse move on, because down', 'handle');
				});

				// up handlers
				$("body").mouseup(function(event) {
					//$(".boxlid-top-handle", that).off("mousemove.boxlid");
					$("body").off("mousemove.boxlid");
					log.log('taking mouse move off, because up', 'handle');
				});
			},
			// blah blah blah
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