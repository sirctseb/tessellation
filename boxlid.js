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
					$("<div></div>", {'class': 'boxlid-handle boxlid-hor-handle boxlid-top-handle'})
				)
				.addClass("boxlid-panel");

				// right panel:
				// add handle
				$(".boxlid-right-panel", this).append(
					$("<div></div>", {'class': 'boxlid-handle boxlid-vert-handle boxlid-right-handle'})
				)
				.addClass("boxlid-panel");

				// left panel:
				// add handle
				$(".boxlid-left-panel", this).append(
					$("<div></div>", {'class': 'boxlid-handle boxlid-vert-handle boxlid-left-handle'})
				)
				.addClass("boxlid-panel");

				// bottom panel:
				// add handle
				$(".boxlid-bottom-panel", this).prepend(
					$("<div></div>", {'class': 'boxlid-handle boxlid-hor-handle boxlid-bottom-handle'})
				)
				.addClass("boxlid-panel");

				// set sizes in pixels
				// set width in pixels for top and left
				$(".boxlid-top-panel, .boxlid-left-panel", this).width(function(index, width) {
					return width;
				});
				// set width in pixels for right and bottom
				$(".boxlid-right-panel", this).width(this.width() - $(".boxlid-top-panel").width() - 1);
				$(".boxlid-bottom-panel", this).width(this.width() - $(".boxlid-left-panel").width() - 1);

				// set height in pixels for top and right
				$(".boxlid-top-panel, .boxlid-left-panel", this).height(function(index, height) {
					return height;
				});
				// set height in pixels for left and bottom
				$(".boxlid-left-panel", this).height(this.height() - $(".boxlid-top-panel").height() - 1);
				$(".boxlid-bottom-panel", this).height(this.height() - $(".boxlid-right-panel").height() - 1);

				// add interaction handlers
				var toppanel = $(".boxlid-top-panel", this);
				var leftpanel = $(".boxlid-left-panel", this);
				var rightpanel = $(".boxlid-right-panel", this);
				var bottompanel = $(".boxlid-bottom-panel", this);

				// top handle drag
				$(".boxlid-top-handle", that).mousedown(function(event) {
					$("body").on("mousemove.boxlid", function(event) {

						// set new height of top panel
						toppanel.height(event.pageY - toppanel.offset().top);

						// set new height of left panel
						leftpanel.height(toppanel.parent().height() - toppanel.height() - 1);

						return false;
					});
				});
				// left handle drag
				$(".boxlid-left-handle", that).mousedown(function(event) {
					$("body").on("mousemove.boxlid", function(event) {

						// set new width of left panel
						leftpanel.width(event.pageX - leftpanel.offset().left);

						// set new width of bottom panel
						bottompanel.width(leftpanel.parent().width() - leftpanel.width() - 1);

						return false;
					});
				});
				// right handle drag
				$(".boxlid-right-handle", that).mousedown(function(event) {
					$("body").on("mousemove.boxlid", function(event) {

						// set new width of right panel
						rightpanel.width(rightpanel.offset().left + rightpanel.width() - event.pageX);

						// set new width of top panel
						toppanel.width(rightpanel.parent().width() - rightpanel.width() - 1);

						return false;
					});
				});
				// bottom handle drag
				$(".boxlid-bottom-handle", that).mousedown(function(event) {
					$("body").on("mousemove.boxlid", function(event) {

						// set new height of bottom panel
						bottompanel.height(bottompanel.offset().top + bottompanel.height() - event.pageY);

						// set new height of right panel
						rightpanel.height(bottompanel.parent().height() - bottompanel.height() - 1);

						return false;
					})
				})

				// up handlers
				$("body").mouseup(function(event) {
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