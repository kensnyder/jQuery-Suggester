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
	module('Events', config);
	test("Event registration", function() {
		expect(10);
		var timesFired = 0;
		var sugg = new $.Suggester($input, {
			onAfterAdd: function(evt) {
				strictEqual(++timesFired, 1, "options.onAfterAdd fires first");
				strictEqual(this, sugg, "options.onAfterAdd should callback in scope of Suggester instance");
				strictEqual(this, evt.target, "event.target should equal Suggester instance");
			}
		});
		sugg.bind('AfterAdd', function(evt) {
			strictEqual(++timesFired, 2, "bind('AfterAdd', handler) fires second");
			strictEqual(this, sugg, "bind() should callback in scope of Suggester instance");
		});
		sugg.on('AfterAdd', function(evt) {
			strictEqual(++timesFired, 3, "another handler (bound via on) fires third");
			strictEqual(this, sugg, "on() should callback in scope of Suggester instance");
		});
		sugg.one('AfterAdd', function(evt) {
			strictEqual(++timesFired, 4, "another handler (bound via one) fires fourth");
			strictEqual(this, sugg, "one() should callback in scope of Suggester instance");
			evt.stopImmediatePropagation();
		});
		sugg.on('AfterAdd', function(evt) {
			++timesFired;
			throw new Error('event.stopImmediatePropagation() should stop other AfterAdd handlers from firing')
		});
		sugg.add('Foo');
		strictEqual(timesFired, 4, "AfterAdd should fire four tiems");
	});
	test("Event deregistration via bind()/unbind()", function() {
		expect(1);
		var timesFired = 0;
		var sugg = new $.Suggester($input);
		var handler = function() {
			++timesFired;
		};
		sugg.bind('AfterAdd', handler);
		sugg.unbind('AfterAdd', handler);		
		sugg.add('Foo');
		strictEqual(timesFired, 0, "Event should not fire if unbound");
	});
	// TODO: test removing all events
	test("Event deregistration via on()/off()", function() {
		expect(1);
		var timesFired = 0;
		var sugg = new $.Suggester($input);
		var handler = function() {
			++timesFired;
		};
		sugg.on('AfterAdd', handler);
		sugg.off('AfterAdd', handler);		
		sugg.add('Foo');
		strictEqual(timesFired, 0, "Event should not fire if off() is called");
	});
	test("Event triggering", function() {
		expect(2);
		var timesFired = 0;
		var sugg = new $.Suggester($input);
		var handler = function(evt) {
			++timesFired;
			strictEqual(this, sugg, "Event should trigger in scope of Suggester instance");
		};
		sugg.on('AfterAdd', handler);
		sugg.trigger('AfterAdd', {foo:1});
		strictEqual(timesFired, 1, "Event should fire on trigger()");
	});
	test("Initialize", function() {
		expect(1);
		var sugg = new $.Suggester($input, {
			onInitialize: function(evt) {				
				ok(true);
			}
		});
	});
	test("BeforeRender", function() {
		expect(2);
		var sugg = new $.Suggester($input, {
			onBeforeRender: function(evt) {				
				strictEqual(evt.widget, this.$widget, 'BeforeRender passes widget');
				strictEqual(this.$box, undefined, 'Rendering has not completed');
			}
		});
	});
	test("AfterRender", function() {
		expect(2);
		var sugg = new $.Suggester($input, {
			onAfterRender: function(evt) {				
				strictEqual(evt.widget, this.$widget, 'AfterRender passes widget');
				strictEqual(this.$box instanceof $, true, 'AfterRender has completed');
			}
		});
	});
	test("BeforeAdd", function() {
		expect(6);
		var order = 0;
		var sugg = new $.Suggester($input,{
			data: products,
			valueProperty: 'id',
			labelProperty: 'name'
		});
		sugg.bind('BeforeAdd', function(evt) {				
			strictEqual(++order, 1, 'BeforeAdd fires before adding');
			strictEqual(evt.value, '1001', 'BeforeAdd event.value');
			strictEqual(evt.label, 'Pencil', 'BeforeAdd event.label');
			strictEqual(evt.item, undefined, 'BeforeAdd event.item');
			deepEqual(evt.record, products[0], 'BeforeAdd event.record');
		});
		sugg.add('1001', 'Pencil');
		strictEqual(++order, 2, 'BeforeAdd fires before adding');		
	});
}(jQuery));
