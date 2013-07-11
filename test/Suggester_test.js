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
	"use strict";
	// shared vars
	var $form, $input;
	var config = {
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
		var sugg = new $.Suggester($input);
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
	//
	// Tag module
	//
	module('$.Suggester.Tag', config);
	test('The tags collection', function() {
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
		strictEqual(tags.length, 1, 'eachTag() should iterate properly')
		strictEqual(sugg.tags[0], tags[0], 'eachTag() should iterate properly')
	});
	test('Properties', function() {
		var sugg = new $.Suggester($input);
		sugg.add('First');
		strictEqual(sugg.tags[0].suggester, sugg, 'Should have a reference to suggester instance');
		strictEqual(sugg.tags[0].getWidget(), sugg, 'getWidget() should return a reference to suggester instance');
	});
	test('Getters and setters', function() {
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
	});
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
    //
	// Suggestions Module
	//
	module('Suggestions', config);
	asyncTest("Too short for suggestion", function() {
		expect(1);
		var sugg = $input.suggester({
			data:planets,
			minChars:3,
			keyDelay:0
		}).suggester('getInstance');
		sendKeys(sugg, ['J','u']);
		setTimeout(function() {
			strictEqual($form.find('.sugg-item').length, 0);
			start();
		}, 1);
	});   
	asyncTest("1 then 2 letters", function() {
		expect(5);
		var sugg = $input.suggester({
			data:planets,
			minChars:1,
			keyDelay:0
		}).suggester('getInstance');
		sendKeys(sugg, ['O']);
		setTimeout(function() {
			strictEqual($('.sugg-item').length, 2);
			strictEqual($('.sugg-item').eq(0).text(), 'Asteroid Belt');
			strictEqual($('.sugg-item').eq(1).text(), 'Pluto');   
			start();
			sendKeys(sugg, ['i']);
			setTimeout(function() {
				strictEqual($('.sugg-item').length, 1);
				strictEqual($('.sugg-item').eq(0).text(), 'Asteroid Belt');
			}, 1);
		}, 1);
	});
	asyncTest("maxSuggestions option", function() {
		expect(2);
		var sugg = $input.suggester({
			data:planets,
			minChars:1,
			keyDelay:0,
			maxSuggestions:1
		}).suggester('getInstance');
		sendKeys(sugg, ['O']);
		setTimeout(function() {
			strictEqual($('.sugg-item').length, 1);
			strictEqual($('.sugg-item').eq(0).text(), 'Asteroid Belt');
			start();
		}, 1);
	});
	asyncTest("Close by clicking document", function() {
		expect(3);
		var sugg = new $.Suggester($input, {
			data:planets,
			minChars:1,
			keyDelay:0
		});
		sendKeys(sugg, ['V','e','n','u']);
		setTimeout(function() {
			strictEqual($('.sugg-item').length, 1);
			strictEqual($('.sugg-item').eq(0).text(), 'Venus');
			setTimeout(function() {
				$(document).trigger({
					type: "click",
					target: document.body
				});
				setTimeout(function() {
					strictEqual($('.sugg-list:visible').length, 0);
					start();                  
				}, 1)
			}, 1);
		}, 1);
	});
	asyncTest("Close by Esc key", function() {
		expect(3);
		var sugg = new $.Suggester($input, {
			data:planets,
			minChars:1,
			keyDelay:0
		});
		sendKeys(sugg, ['V','e','n','u']);
		setTimeout(function() {
			strictEqual($('.sugg-item').length, 1);
			strictEqual($('.sugg-item').eq(0).text(), 'Venus');
			start();
			sendKey(sugg, 'ESC');
			strictEqual($('.sugg-list:visible').length, 0);
		}, 1);
	});
	asyncTest("Navigate using arrows", function() {
		expect(9);
		var sugg = new $.Suggester($input, {
			data:planets,
			minChars:1,
			keyDelay:0
		});
		sendKeys(sugg, ['e','r']);
		setTimeout(function() {
			strictEqual($('.sugg-item').length, 4);
			strictEqual($('.sugg-item').eq(0).text(), 'Mercury');
			strictEqual($('.sugg-item').eq(1).text(), 'Asteroid Belt');
			strictEqual($('.sugg-item').eq(2).text(), 'Jupiter');
			strictEqual($('.sugg-item').eq(3).text(), 'Eres');
			start();
			sendKeys(sugg, ['DOWN']);
			setTimeout(function() {
				strictEqual($('.sugg-item:visible').eq(0).hasClass('sugg-selected'), true);
				strictEqual($('.sugg-item:visible').eq(1).hasClass('sugg-selected'), false);
				strictEqual($('.sugg-item:visible').eq(2).hasClass('sugg-selected'), false);
				strictEqual($('.sugg-item:visible').eq(3).hasClass('sugg-selected'), false);
			}, 1);
		}, 1);
	});
	asyncTest("Navigate using hover", function() {
		expect(9);
		var sugg = new $.Suggester($input, {
			data:planets,
			minChars:1,
			keyDelay:0
		});
		sendKeys(sugg, ['e','r']);
		setTimeout(function() {
			strictEqual($('.sugg-item').length, 4);
			strictEqual($('.sugg-item').eq(0).text(), 'Mercury');
			strictEqual($('.sugg-item').eq(1).text(), 'Asteroid Belt');
			strictEqual($('.sugg-item').eq(2).text(), 'Jupiter');
			strictEqual($('.sugg-item').eq(3).text(), 'Eres');
			start();
			$('.sugg-item').eq(2).trigger({
				type: 'mouseover'
			});     
			strictEqual($('.sugg-item:visible').eq(0).hasClass('sugg-selected'), false);
			strictEqual($('.sugg-item:visible').eq(1).hasClass('sugg-selected'), false);
			strictEqual($('.sugg-item:visible').eq(2).hasClass('sugg-selected'), true);
			strictEqual($('.sugg-item:visible').eq(3).hasClass('sugg-selected'), false);
		}, 1);
	});
	asyncTest("Add via click on suggestion", function() {
		expect(7);
		var sugg = new $.Suggester($input, {
			data:planets,
			minChars:1,
			keyDelay:0
		});
		sendKeys(sugg, ['a','r']);
		setTimeout(function() {
			strictEqual($('.sugg-item').length, 2);
			strictEqual($('.sugg-item').eq(0).text(), 'Earth');
			strictEqual($('.sugg-item').eq(1).text(), 'Mars');
			start();
			$('.sugg-item').eq(1).trigger({
				type: 'click'
			});   
			strictEqual($('.sugg-item:visible').length, 0);
			strictEqual($form.find('.sugg-label').html(), 'Mars');
			strictEqual($form.find('input[type=hidden]').val(), 'Mars');
			strictEqual($input.val(), 'Mars');
		}, 1);
	});
	asyncTest("Don't suggest an item that was already added", function() {
		expect(2);
		var sugg = new $.Suggester($input, {
			data:planets,
			minChars:1,
			keyDelay:0
		});
		sugg.add('Earth');
		sendKeys(sugg, ['a','r']);
		setTimeout(function() {
			strictEqual($('.sugg-item').length, 1);
			strictEqual($('.sugg-item').eq(0).text(), 'Mars');
			start();
		}, 1);
	}); 
	asyncTest("Set options.matchAt to 0 to match at beginning of word", function() {
		expect(3);
		var sugg = new $.Suggester($input, {
			data:planets,
			minChars:1,
			keyDelay:0,
			matchAt:0
		});
		sendKeys(sugg, ['e']);
		setTimeout(function() {
			strictEqual($('.sugg-item').length, 2);
			strictEqual($('.sugg-item').eq(0).text(), 'Earth');
			strictEqual($('.sugg-item').eq(1).text(), 'Eres');
			start();
		}, 1);
	}); 
	if (window.location.protocol != 'file:') {
		asyncTest("Suggestions via Ajax", function() {
			expect(3);
			var sugg = $input.suggester({
				dataUrl:'./assets/stars-canis-ajax.js?query=%s',
				keyDelay:2
			}).suggester('getInstance');
			sendKeys(sugg, ['C','a','n','i','s'])
			setTimeout(function() {
				strictEqual($('.sugg-item').length, 2);
				strictEqual($('.sugg-item').eq(0).text(), 'Canis Major');
				strictEqual($('.sugg-item').eq(1).text(), 'Canis Minor'); 
				start();
			}, 1500);
		});   
	}
	if (window.location.protocol != 'file:' && window.location.href.match(/(\?|&)php\b/)) {
		asyncTest("Suggestions via JSONP", function() {
			expect(3);
			var sugg = $input.suggester({
				dataType:'jsonp',
				dataUrl:'./assets/stars-canis-jsonp.php?query=%s&mycallback=%s',
				keyDelay:2
			}).suggester('getInstance');
			sendKeys(sugg, ['C','a','n','i','s'])
			setTimeout(function() {
				strictEqual($('.sugg-item').length, 2);
				strictEqual($('.sugg-item').eq(0).text(), 'Canis Major');
				strictEqual($('.sugg-item').eq(1).text(), 'Canis Minor'); 
				start();
			}, 1500);
		});   
	}
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
