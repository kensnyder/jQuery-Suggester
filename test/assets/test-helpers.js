(function($) { "use strict";
	window.sendKeys = function(sugg, arr) {
		$.each(arr, function() {
			window.sendKey(sugg, this);
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
		triggerKey(sugg.$input ? sugg.$input.get(0) : false || document, special[str] || str.charCodeAt(0));
		if (!special[str]) {		
			sugg.$input[0].value += str;
		}
	};
	
function triggerKey(element, which) {
	var evt;
	if (document.createEvent) {
		evt = document.createEvent('KeyboardEvent');
		(evt.initKeyboardEvent || evt.initKeyEvent).call(evt,
			"keydown", // event type : keydown, keyup, keypress
			true, // bubbles
			true, // cancelable
			null, // viewArg
			false, // ctrlKeyArg
			false, // altKeyArg
			false, // shiftKeyArg
			false, // metaKeyArg
			which, // keyCodeArg : unsigned long the virtual key code, else 0
			0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
		);
		element.dispatchEvent(evt);
	}
	else if (document.createEventObject) {
		evt = document.createEventObject();
		element.fireEvent('onkeydown', evt);
	}
}	

	
})(jQuery);