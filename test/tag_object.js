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
	// Tag module
	//
	module('$.Suggester.Tag');
	test('The tags collection', function() {
		var $input = generateInput();
		var sugg = new $.Suggester($input);
		sugg.add('First');
		strictEqual(sugg.tags.length, 1, 'Should have exact length');
		strictEqual(sugg.tags[0] instanceof $.Suggester.Tag, true, 'Tags should be an instance of $.Suggester.Tag');
		strictEqual(sugg.getTags()[0], sugg.tags[0], 'getTags() should contain the exact tag objects');
		notStrictEqual(sugg.getTags(), sugg.tags, 'But getTags() should be a copy of the array');
		var tags = [];
		sugg.eachTag(function(i, tag) {
			tags[i] = tag;
		});
		strictEqual(tags.length, 1, 'eachTag() should iterate properly');
		strictEqual(sugg.tags[0], tags[0], 'eachTag() should iterate properly');
		$input.teardown();
	});
	test('Properties', function() {
		var $input = generateInput();
		var sugg = new $.Suggester($input);
		sugg.add('First');
		strictEqual(sugg.tags[0].suggester, sugg, 'Should have a reference to suggester instance');
		strictEqual(sugg.tags[0].getWidget(), sugg, 'getWidget() should return a reference to suggester instance');
		$input.teardown();
	});
	test('Getters and setters', function() {
		var $input = generateInput();
		var sugg = new $.Suggester($input);
		sugg.add('First');
		strictEqual(sugg.tags[0].getValue(), 'First', 'Value should be set');
		strictEqual(sugg.tags[0].getHidden().val(), 'First', 'Hidden input should be set');
		strictEqual(sugg.tags[0].getElement().find('.sugg-label').text(), 'First', 'Tag text control test');
		sugg.tags[0].setValue('Second');
		strictEqual(sugg.tags[0].getValue(), 'Second', 'Value should be changeable');
		strictEqual(sugg.tags[0].getHidden().val(), 'Second', 'Value change should affect hidden input');
		strictEqual($input.val(), 'Second', 'Value change should affect original input');
		strictEqual(sugg.tags[0].getElement().find('.sugg-label').text(), 'First', 'Value change should NOT affect tag text');    
		$input.teardown();
	});
}(jQuery));
