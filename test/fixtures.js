(function($) {
	// setup and teardown a form with an input
	window.generateInput = function() {
		var $form = $('<form class="sugg"><input type="text" name="suggestable" value="" /></form>').appendTo(document.body);
		var $input = $form.find('input');
		$input.teardown = function() {
			$form.remove();
		};
		$input.$form = $form;
		return $input;
	};
})(jQuery);