/*
  ======== A Handy Little QUnit Reference ========
  http://api.qunitjs.com/

  Test methods:
    module(name, {[setup][ ,teardown]})
    test(name, callback)
    expect(numberOfAssertions)
    stop(increment)
    start(decrement)
  Test assertions:
    ok(value, [message])
    equal(actual, expected, [message])
    notEqual(actual, expected, [message])
    deepEqual(actual, expected, [message])
    notDeepEqual(actual, expected, [message])
    strictEqual(actual, expected, [message])
    notStrictEqual(actual, expected, [message])
    throws(block, [expected], [message])
*/
(function($) {
	//
	// getValue() and setValue()
	//
	module('getValue() and setValue()');
	test("Pre-filled items", function() {
		var $input = generateInput();
		$input.val('Uranus,Jupiter');
		$input.suggester({
			data:planets
		});
		strictEqual($input.$form.find('.sugg-label').length, 2);
		strictEqual($input.$form.find('.sugg-label').eq(0).text(), 'Uranus');
		strictEqual($input.$form.find('.sugg-label').eq(1).text(), 'Jupiter');
		strictEqual($input.$form.find('input[type=hidden]').length, 2);
		strictEqual($input.$form.find('input[type=hidden]').eq(0).val(), 'Uranus');
		strictEqual($input.$form.find('input[type=hidden]').eq(1).val(), 'Jupiter');
		$input.teardown();
	});	
	test("Pre-filled items with escaped comma", function() {
		var $input = generateInput();
		$input.val('Piano Guys\\, The, Knight\'s Tale\\, A');
		$input.suggester();
		strictEqual($input.$form.find('.sugg-label').length, 2);
		strictEqual($input.$form.find('.sugg-label').eq(0).text(), 'Piano Guys, The');
		strictEqual($input.$form.find('.sugg-label').eq(1).text(), 'Knight\'s Tale, A');
		strictEqual($input.$form.find('input[type=hidden]').length, 2);
		strictEqual($input.$form.find('input[type=hidden]').eq(0).val(), 'Piano Guys, The');
		strictEqual($input.$form.find('input[type=hidden]').eq(1).val(), 'Knight\'s Tale, A');
		$input.teardown();
	});	
	test("Call setValue() with string", function() {
		var $input = generateInput();
		var sugg = new $.Suggester($input);
		sugg.setValue('Piano Guys\\, The, Knight\'s Tale\\, A');
		strictEqual($input.$form.find('.sugg-label').length, 2);
		strictEqual($input.$form.find('.sugg-label').eq(0).text(), 'Piano Guys, The');
		strictEqual($input.$form.find('.sugg-label').eq(1).text(), 'Knight\'s Tale, A');
		strictEqual($input.$form.find('input[type=hidden]').length, 2);
		strictEqual($input.$form.find('input[type=hidden]').eq(0).val(), 'Piano Guys, The');
		strictEqual($input.$form.find('input[type=hidden]').eq(1).val(), 'Knight\'s Tale, A');		
		$input.teardown();
	});
	test("Call setValue() with array", function() {
		var $input = generateInput();
		var sugg = new $.Suggester($input);
		sugg.setValue(['one','two']);
		strictEqual($input.$form.find('.sugg-label').length, 2);
		strictEqual($input.$form.find('.sugg-label').eq(0).text(), 'one');
		strictEqual($input.$form.find('.sugg-label').eq(1).text(), 'two');
		strictEqual($input.$form.find('input[type=hidden]').length, 2);
		strictEqual($input.$form.find('input[type=hidden]').eq(0).val(), 'one');
		strictEqual($input.$form.find('input[type=hidden]').eq(1).val(), 'two');		
		$input.teardown();
	});
	test("Pre-filled items", function() {
		var $input = generateInput();
		$input.val('Uranus,Jupiter');
		var sugg = new $.Suggester($input, {
			data:planets
		});
		strictEqual($input.$form.find('.sugg-label').length, 2);
		strictEqual($input.$form.find('.sugg-label').eq(0).text(), 'Uranus');
		strictEqual($input.$form.find('.sugg-label').eq(1).text(), 'Jupiter');
		strictEqual($input.$form.find('input[type=hidden]').length, 2);
		strictEqual($input.$form.find('input[type=hidden]').eq(0).val(), 'Uranus');
		strictEqual($input.$form.find('input[type=hidden]').eq(1).val(), 'Jupiter');
		strictEqual(sugg.tags.length, 2, 'Tags collection has length 2');
		sugg.setValue('Mars');
		strictEqual($input.$form.find('.sugg-label').length, 1);
		strictEqual($input.$form.find('.sugg-label').eq(0).text(), 'Mars');
		strictEqual($input.$form.find('input[type=hidden]').length, 1);
		strictEqual($input.$form.find('input[type=hidden]').eq(0).val(), 'Mars');		
		strictEqual(sugg.tags.length, 1, 'Tags collection has length 1');
		$input.teardown();
	});
	asyncTest("Placeholders", function() {
		var $input = generateInput();
		expect(2);
		var sugg = $input.suggester({
			placeholder:'Enter tags...'
		}).suggester('getInstance');
		strictEqual(sugg.$input.val(), sugg.options.placeholder);
		sugg.focus();
		setTimeout(function() {
			strictEqual(sugg.$input.val(), '');
			start();
			$input.teardown();
		}, 500);
	});	
}(jQuery));
