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
	});	
	test("Call setValue()", function() {
		var $input = generateInput();
		var sugg = new $.Suggester($input);
		sugg.setValue('Piano Guys\\, The, Knight\'s Tale\\, A');
		strictEqual($input.$form.find('.sugg-label').length, 2);
		strictEqual($input.$form.find('.sugg-label').eq(0).text(), 'Piano Guys, The');
		strictEqual($input.$form.find('.sugg-label').eq(1).text(), 'Knight\'s Tale, A');
		strictEqual($input.$form.find('input[type=hidden]').length, 2);
		strictEqual($input.$form.find('input[type=hidden]').eq(0).val(), 'Piano Guys, The');
		strictEqual($input.$form.find('input[type=hidden]').eq(1).val(), 'Knight\'s Tale, A');		
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
		}, 500);
	});	
}(jQuery));
