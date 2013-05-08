(function($) { "use strict";
	window.sendKeys = function(sugg, arr) {
		$.each(arr, function() {
			sendKey(sugg, this);
		});
	};
	window.sendKey = function(sugg, str) {
		var special = {
			UP: 39,
			DOWN: 40,
			BACKSPACE: 8,
			DELETE: 46,
			TAB: 9,
			',': 188,
			ENTER: 13,
			ESC: 27
		};
		(sugg.$input || $(document)).trigger({
			type: 'keydown', 
			which: special[str] || str.charCodeAt(0)
		});
		if (!special[str]) {		
			sugg.$input[0].value += str;
		}
	};
})(jQuery);