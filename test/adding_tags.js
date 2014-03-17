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
	module('Adding Tags');
	test("Original element is not visible", function() {
		var $input = generateInput();
		$input.suggester();
		strictEqual($input.is(':visible'), false);
	});
	test("Form has new text input", function() {
		var $input = generateInput();
		$input.suggester();
		strictEqual($input.$form.find('input[type=text]:visible').length, 1);
	});
	test("add(value)", function() {
		var $input = generateInput();
		$input.suggester({
			data:planets
		});
		var $tag = $input.suggester('add', 'Pluto');
		strictEqual($tag.data('tag-value'), 'Pluto');
		strictEqual($input.$form.find('input[type=hidden]').val(), 'Pluto');
		strictEqual($input.$form.find('.sugg-label').html(), 'Pluto');
	}); 
	test("add(value) custom", function() {
		var $input = generateInput();
		$input.suggester({
			data:['one','two','three']
			});
		var $tag = $input.suggester('add', 'four');
		strictEqual($tag.data('tag-value'), 'four');
		strictEqual($input.$form.find('input[type=hidden]').val(), 'four');
		strictEqual($input.$form.find('.sugg-label').html(), 'four');
	}); 
	test("add(value, label)", function() {
		var $input = generateInput();
		$input.suggester();
		var $tag = $input.suggester('add', '4', 'four');
		strictEqual($tag.data('tag-value'), '4');
		strictEqual($tag.data('tag-label'), 'four');
		strictEqual($input.$form.find('input[type=hidden]').val(), '4');
		strictEqual($input.$form.find('.sugg-label').html(), 'four');
	}); 
	test("Add by typing", function() {
		var $input = generateInput();
		var sugg = $input.suggester({
			data:planets
		}).suggester('getInstance');
		sugg.$input.val('Mars');
		sendKey(sugg, ',');
		strictEqual($input.$form.find('input[type=hidden]').val(), 'Mars');
		strictEqual($input.$form.find('.sugg-label').html(), 'Mars');  
		strictEqual(sugg.$input.val(), ''); 
	});
	test("Add by typing custom", function() {
		var $input = generateInput();
		var sugg = $input.suggester({
			data:planets
		}).suggester('getInstance');
		sugg.$input.val('Custom');
		sendKey(sugg, ',');
		strictEqual($input.$form.find('input[type=hidden]').val(), 'Custom');
		strictEqual($input.$form.find('.sugg-label').html(), 'Custom');    
		strictEqual(sugg.$input.val(), ''); 
	});
	test("Original input value properly populated", function() {
		var $input = generateInput();
		var sugg = $input.suggester({
			data:planets
		}).suggester('getInstance');
		sugg.add('Custom 1');
		sugg.add('lname, fname');
		sugg.add('doe, john');
		strictEqual($input.$form.find('.sugg-label').length, 3);
		strictEqual($input.val(), 'Custom 1,lname\\, fname,doe\\, john');
	});
	test("add() then remove()", function() {
		var $input = generateInput();
		$input.suggester({
			data:planets
		});
		var $tag = $input.suggester('add', 'Earth');
		strictEqual($tag.data('tag-value'), 'Earth');
		strictEqual($input.$form.find('input[type=hidden]').val(), 'Earth');
		strictEqual($input.$form.find('.sugg-label').text(), 'Earth');
		$input.suggester('remove', 'Earth');
		strictEqual($input.$form.find('input[type=hidden]').length, 0);
		strictEqual($input.$form.find('.sugg-label').length, 0);
	});   
	test("add() custom then remove()", function() {
		var $input = generateInput();
		$input.suggester({
			data:planets
		});
		var $tag = $input.suggester('add', 'Custom');
		strictEqual($tag.data('tag-value'), 'Custom');
		strictEqual($input.$form.find('input[type=hidden]').val(), 'Custom');
		strictEqual($input.$form.find('.sugg-label').text(), 'Custom');
		$input.suggester('remove', 'Custom');
		strictEqual($input.$form.find('input[type=hidden]').length, 0);
		strictEqual($input.$form.find('.sugg-label').length, 0);
	});   
	test("add() then remove by backspace", function() {
		var $input = generateInput();
		var sugg = $input.suggester({
			data:planets
		}).suggester('getInstance');
		var $tag = sugg.add('Sun');
		sendKeys(sugg, ['BACKSPACE']);
		strictEqual($tag.hasClass('sugg-focused'), true);
		sendKeys(sugg, ['BACKSPACE']);
		strictEqual($input.$form.find('input[type=hidden]').length, 0);
		strictEqual($input.$form.find('.sugg-label').length, 0);
	});
	test("add() then click to select", function() {
		var $input = generateInput();
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
		var $input = generateInput();
		var sugg = $input.suggester({
			data:planets
		}).suggester('getInstance');
		var $tag = sugg.add('Mercury');
		$tag.find('.sugg-remove').trigger({
			type: 'click'
		});
		strictEqual($input.$form.find('input[type=hidden]').length, 0);
		strictEqual($input.$form.find('.sugg-label').length, 0);
	});
	test("add() then click to select, then delete key", function() {
		var $input = generateInput();
		var sugg = $input.suggester({
			data:planets
		}).suggester('getInstance');
		var $tag = sugg.add('Jupiter');
		$tag.trigger({
			type: 'click'
		});
		sendKey(document, 'DELETE');
		strictEqual($input.$form.find('input[type=hidden]').length, 0);
		strictEqual($input.$form.find('.sugg-label').length, 0);   
	});
	asyncTest("options.addOnBlur", function() {
		var $input = generateInput();
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
		var $input = generateInput();
		var sugg = new $.Suggester($input);
		sugg.add('Foo');
		strictEqual(sugg.tags.length, 1);
		strictEqual($input.val(), 'Foo');
		strictEqual($input.$form.find('input[type=hidden]').length, 1);
		sugg.clear();
		strictEqual($input.val(), '');
		strictEqual(sugg.tags.length, 0);
		strictEqual($input.$form.find('input[type=hidden]').length, 0);
	});
}(jQuery));
