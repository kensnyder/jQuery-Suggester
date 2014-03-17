// variables common to all tests
var $form
  , $input
  , config;

// setup and teardown
(function($) {
	config = {
		// setup a test form
		setup: function() {
			$form = $('<form class="sugg"><input type="text" name="suggestable" value="" /></form>').appendTo(document.body);
			$input = $form.find('input');
		},
		// teardown the form
		teardown: function() {
			$form.remove();
			$('.sugg-list').remove();
		}
	};  
})(jQuery);