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
	// Adding Tags Module
	//
	module('Adding Tags', config);
	test("Original element is not visible", function() {
		$input.suggester();
		strictEqual($input.is(':visible'), false);
	});
	test("Form has new text input", function() {
		$input.suggester();
		strictEqual($form.find('input[type=text]:visible').length, 1);
	});
	test("add(value)", function() {
		$input.suggester({
			data:planets
		});
		var $tag = $input.suggester('add', 'Pluto');
		strictEqual($tag.data('tag-value'), 'Pluto');
		strictEqual($form.find('input[type=hidden]').val(), 'Pluto');
		strictEqual($form.find('.sugg-label').html(), 'Pluto');
	}); 
	test("add(value) custom", function() {
		$input.suggester({
			data:['one','two','three']
			});
		var $tag = $input.suggester('add', 'four');
		strictEqual($tag.data('tag-value'), 'four');
		strictEqual($form.find('input[type=hidden]').val(), 'four');
		strictEqual($form.find('.sugg-label').html(), 'four');
	}); 
	test("add(value, label)", function() {
		$input.suggester();
		var $tag = $input.suggester('add', '4', 'four');
		strictEqual($tag.data('tag-value'), '4');
		strictEqual($tag.data('tag-label'), 'four');
		strictEqual($form.find('input[type=hidden]').val(), '4');
		strictEqual($form.find('.sugg-label').html(), 'four');
	}); 
	test("Add by typing", function() {
		var sugg = $input.suggester({
			data:planets
		}).suggester('getInstance');
		sugg.$input.val('Mars');
		sendKey(sugg, ',');
		strictEqual($form.find('input[type=hidden]').val(), 'Mars');
		strictEqual($form.find('.sugg-label').html(), 'Mars');  
		strictEqual(sugg.$input.val(), ''); 
	});
	test("Add by typing custom", function() {
		var sugg = $input.suggester({
			data:planets
		}).suggester('getInstance');
		sugg.$input.val('Custom');
		sendKey(sugg, ',');
		strictEqual($form.find('input[type=hidden]').val(), 'Custom');
		strictEqual($form.find('.sugg-label').html(), 'Custom');    
		strictEqual(sugg.$input.val(), ''); 
	});
	test("Original input value properly populated", function() {
		var sugg = $input.suggester({
			data:planets
		}).suggester('getInstance');
		sugg.add('Custom 1');
		sugg.add('lname, fname');
		sugg.add('doe, john');
		strictEqual($form.find('.sugg-label').length, 3);
		strictEqual($input.val(), 'Custom 1,lname\\, fname,doe\\, john');
	});
	test("add() then remove()", function() {
		$input.suggester({
			data:planets
		});
		var $tag = $input.suggester('add', 'Earth');
		strictEqual($tag.data('tag-value'), 'Earth');
		strictEqual($form.find('input[type=hidden]').val(), 'Earth');
		strictEqual($form.find('.sugg-label').text(), 'Earth');
		$input.suggester('remove', 'Earth');
		strictEqual($form.find('input[type=hidden]').length, 0);
		strictEqual($form.find('.sugg-label').length, 0);
	});   
	test("add() custom then remove()", function() {
		$input.suggester({
			data:planets
		});
		var $tag = $input.suggester('add', 'Custom');
		strictEqual($tag.data('tag-value'), 'Custom');
		strictEqual($form.find('input[type=hidden]').val(), 'Custom');
		strictEqual($form.find('.sugg-label').text(), 'Custom');
		$input.suggester('remove', 'Custom');
		strictEqual($form.find('input[type=hidden]').length, 0);
		strictEqual($form.find('.sugg-label').length, 0);
	});   
	test("add() then remove by backspace", function() {
		var sugg = $input.suggester({
			data:planets
		}).suggester('getInstance');
		var $tag = sugg.add('Sun');
		sendKeys(sugg, ['BACKSPACE']);
		strictEqual($tag.hasClass('sugg-focused'), true);
		sendKeys(sugg, ['BACKSPACE']);
		strictEqual($form.find('input[type=hidden]').length, 0);
		strictEqual($form.find('.sugg-label').length, 0);
	});
	test("add() then click to select", function() {
		var sugg = $input.suggester({
			data:planets
		}).suggester('getInstance');
		var $tag = sugg.add('Saturn');
		$tag.trigger({
			type: 'click'
		});
		strictEqual($tag.hasClass('sugg-focused'), true);
	}); 
	test("add() then remove by clicking `X`", function() {
		var sugg = $input.suggester({
			data:planets
		}).suggester('getInstance');
		var $tag = sugg.add('Mercury');
		$tag.find('.sugg-remove').trigger({
			type: 'click'
		});
		strictEqual($form.find('input[type=hidden]').length, 0);
		strictEqual($form.find('.sugg-label').length, 0);
	});
	test("add() then click to select, then delete key", function() {
		var sugg = $input.suggester({
			data:planets
		}).suggester('getInstance');
		var $tag = sugg.add('Jupiter');
		$tag.trigger({
			type: 'click'
		});
		sendKey(document, 'DELETE');
		strictEqual($form.find('input[type=hidden]').length, 0);
		strictEqual($form.find('.sugg-label').length, 0);   
	});
	asyncTest("options.addOnBlur", function() {
		expect(2);
		var sugg = new $.Suggester($input, {
			addOnBlur: true
		});
		sendKeys(sugg, ['t','e','s','t']);
		sugg.$input.trigger({
			type:'blur'
		});
		setTimeout(function() {		
			strictEqual(sugg.tags.length, 1, 'Custom tag is added after blur');
			strictEqual($input.val(), 'test', 'Custom tag has expected value');   
			start();
		}, 1000);
	});
	test("clear()", function() {
		var sugg = new $.Suggester($input);
		sugg.add('Foo');
		strictEqual(sugg.tags.length, 1);
		strictEqual($input.val(), 'Foo');
		strictEqual($form.find('input[type=hidden]').length, 1);
		sugg.clear();
		strictEqual($input.val(), '');
		strictEqual(sugg.tags.length, 0);
		strictEqual($form.find('input[type=hidden]').length, 0);
	});
	test("Pre-filled items", function() {
		$input.val('Uranus,Jupiter');
		var sugg = $input.suggester({
			data:planets
		});
		strictEqual($('.sugg-label').length, 2);
		strictEqual($('.sugg-label').eq(0).text(), 'Uranus');
		strictEqual($('.sugg-label').eq(1).text(), 'Jupiter');
		strictEqual($form.find('input[type=hidden]').length, 2);
		strictEqual($form.find('input[type=hidden]').eq(0).val(), 'Uranus');
		strictEqual($form.find('input[type=hidden]').eq(1).val(), 'Jupiter');
	});
	asyncTest("Placeholders", function() {
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
