// a jquery plugin for a box lid type layout
(function($) {

	$.fn.boxlid = function(method) {
		var methods = {
			init: function(options) {
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