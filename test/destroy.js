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
	// Destroy Module
	//
	module('Destroy', config);
	test("destroy() keeps values on original input", function() {
		var sugg = new $.Suggester($input);
		sugg.add('One');
		sugg.add('Two');
		sugg.destroy();
		strictEqual($input.val(), 'One,Two');
		strictEqual(sugg.tags.length, 0);
	});
}(jQuery));
