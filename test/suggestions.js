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
	// Suggestions Module
	//
	module('Suggestions');
	asyncTest("Too short for suggestion", function() {
		var $input = generateInput();
		expect(1);
		var sugg = $input.suggester({
			data:planets,
			minChars:3,
			keyDelay:0
		}).suggester('getInstance');
		sendKeys(sugg, ['J','u']);
		setTimeout(function() {
			strictEqual($input.$form.find('.sugg-item').length, 0);
			start();
			$input.teardown();
		}, 1);
	});   
	asyncTest("1 then 2 letters", function() {
		var $input = generateInput();
		expect(5);
		var sugg = $input.suggester({
			data:planets,
			minChars:1,
			keyDelay:0
		}).suggester('getInstance');
		sendKeys(sugg, ['O']);
		setTimeout(function() {
			strictEqual($input.$form.find('.sugg-item').length, 2);
			strictEqual($input.$form.find('.sugg-item').eq(0).text(), 'Asteroid Belt');
			strictEqual($input.$form.find('.sugg-item').eq(1).text(), 'Pluto');   
			start();
			sendKeys(sugg, ['i']);
			setTimeout(function() {
				strictEqual($input.$form.find('.sugg-item').length, 1);
				strictEqual($input.$form.find('.sugg-item').eq(0).text(), 'Asteroid Belt');
				$input.teardown();
			}, 1);
		}, 1);
	});
	asyncTest("maxSuggestions option", function() {
		var $input = generateInput();
		expect(2);
		var sugg = $input.suggester({
			data:planets,
			minChars:1,
			keyDelay:0,
			maxSuggestions:1
		}).suggester('getInstance');
		sendKeys(sugg, ['O']);
		setTimeout(function() {
			strictEqual($input.$form.find('.sugg-item').length, 1);
			strictEqual($input.$form.find('.sugg-item').eq(0).text(), 'Asteroid Belt');
			start();
			$input.teardown();
		}, 1);
	});
	asyncTest("Close by clicking document", function() {
		var $input = generateInput();
		expect(3);
		var sugg = new $.Suggester($input, {
			data:planets,
			minChars:1,
			keyDelay:0
		});
		sendKeys(sugg, ['V','e','n','u']);
		setTimeout(function() {
			strictEqual($input.$form.find('.sugg-item').length, 1);
			strictEqual($input.$form.find('.sugg-item').eq(0).text(), 'Venus');
			setTimeout(function() {
				$(document).trigger({
					type: "click",
					target: document.body
				});
				setTimeout(function() {
					strictEqual($input.$form.find('.sugg-list:visible').length, 0);
					start();                  
					$input.teardown();
				}, 1)
			}, 1);
		}, 1);
	});
	asyncTest("Close by Esc key", function() {
		var $input = generateInput();
		expect(3);
		var sugg = new $.Suggester($input, {
			data:planets,
			minChars:1,
			keyDelay:0
		});
		sendKeys(sugg, ['V','e','n','u']);
		setTimeout(function() {
			strictEqual($input.$form.find('.sugg-item').length, 1);
			strictEqual($input.$form.find('.sugg-item').eq(0).text(), 'Venus');
			start();
			sendKey(sugg, 'ESC');
			strictEqual($input.$form.find('.sugg-list:visible').length, 0);
			$input.teardown();
		}, 1);
	});
	asyncTest("Navigate using arrows", function() {
		var $input = generateInput();
		expect(9);
		var sugg = new $.Suggester($input, {
			data:planets,
			minChars:1,
			keyDelay:0
		});
		sendKeys(sugg, ['e','r']);
		setTimeout(function() {
			strictEqual($input.$form.find('.sugg-item').length, 4);
			strictEqual($input.$form.find('.sugg-item').eq(0).text(), 'Mercury');
			strictEqual($input.$form.find('.sugg-item').eq(1).text(), 'Asteroid Belt');
			strictEqual($input.$form.find('.sugg-item').eq(2).text(), 'Jupiter');
			strictEqual($input.$form.find('.sugg-item').eq(3).text(), 'Eres');
			start();
			sendKeys(sugg, ['DOWN']);
			setTimeout(function() {
				strictEqual($input.$form.find('.sugg-item:visible').eq(0).hasClass('sugg-selected'), true);
				strictEqual($input.$form.find('.sugg-item:visible').eq(1).hasClass('sugg-selected'), false);
				strictEqual($input.$form.find('.sugg-item:visible').eq(2).hasClass('sugg-selected'), false);
				strictEqual($input.$form.find('.sugg-item:visible').eq(3).hasClass('sugg-selected'), false);
				$input.teardown();
			}, 1);
		}, 1);
	});
	asyncTest("Navigate using hover", function() {
		var $input = generateInput();
		expect(9);
		var sugg = new $.Suggester($input, {
			data:planets,
			minChars:1,
			keyDelay:0
		});
		sendKeys(sugg, ['e','r']);
		setTimeout(function() {
			strictEqual($input.$form.find('.sugg-item').length, 4);
			strictEqual($input.$form.find('.sugg-item').eq(0).text(), 'Mercury');
			strictEqual($input.$form.find('.sugg-item').eq(1).text(), 'Asteroid Belt');
			strictEqual($input.$form.find('.sugg-item').eq(2).text(), 'Jupiter');
			strictEqual($input.$form.find('.sugg-item').eq(3).text(), 'Eres');
			start();
			$input.$form.find('.sugg-item').eq(2).trigger({
				type: 'mouseover'
			});     
			strictEqual($input.$form.find('.sugg-item:visible').eq(0).hasClass('sugg-selected'), false);
			strictEqual($input.$form.find('.sugg-item:visible').eq(1).hasClass('sugg-selected'), false);
			strictEqual($input.$form.find('.sugg-item:visible').eq(2).hasClass('sugg-selected'), true);
			strictEqual($input.$form.find('.sugg-item:visible').eq(3).hasClass('sugg-selected'), false);
			$input.teardown();
		}, 1);
	});
	asyncTest("Add via click on suggestion", function() {
		var $input = generateInput();
		expect(7);
		var sugg = new $.Suggester($input, {
			data:planets,
			minChars:1,
			keyDelay:0
		});
		sendKeys(sugg, ['a','r']);
		setTimeout(function() {
			strictEqual($input.$form.find('.sugg-item').length, 2);
			strictEqual($input.$form.find('.sugg-item').eq(0).text(), 'Earth');
			strictEqual($input.$form.find('.sugg-item').eq(1).text(), 'Mars');
			start();
			$input.$form.find('.sugg-item').eq(1).trigger({
				type: 'click'
			});   
			strictEqual($input.$form.find('.sugg-item:visible').length, 0);
			strictEqual($input.$form.find('.sugg-label').html(), 'Mars');
			strictEqual($input.$form.find('input[type=hidden]').val(), 'Mars');
			strictEqual($input.val(), 'Mars');
			$input.teardown();
		}, 1);
	});
	asyncTest("Don't suggest an item that was already added", function() {
		var $input = generateInput();
		expect(2);
		var sugg = new $.Suggester($input, {
			data:planets,
			minChars:1,
			keyDelay:0
		});
		sugg.add('Earth');
		sendKeys(sugg, ['a','r']);
		setTimeout(function() {
			strictEqual($input.$form.find('.sugg-item').length, 1);
			strictEqual($input.$form.find('.sugg-item').eq(0).text(), 'Mars');
			start();
			$input.teardown();
		}, 1);
	}); 
	asyncTest("Set options.matchAt to 0 to match at beginning of word", function() {
		var $input = generateInput();
		expect(3);
		var sugg = new $.Suggester($input, {
			data:planets,
			minChars:1,
			keyDelay:0,
			matchAt:0
		});
		sendKeys(sugg, ['e']);
		setTimeout(function() {
			strictEqual($input.$form.find('.sugg-item').length, 2);
			strictEqual($input.$form.find('.sugg-item').eq(0).text(), 'Earth');
			strictEqual($input.$form.find('.sugg-item').eq(1).text(), 'Eres');
			start();
			$input.teardown();
		}, 1);
	}); 
	if (window.location.protocol != 'file:') {
		asyncTest("Suggestions via Ajax", function() {
			var $input = generateInput();
			expect(3);
			var sugg = $input.suggester({
				dataUrl:'./assets/stars-canis-ajax.js?query=%s',
				keyDelay:2
			}).suggester('getInstance');
			sendKeys(sugg, ['C','a','n','i','s'])
			setTimeout(function() {
				strictEqual($input.$form.find('.sugg-item').length, 2);
				strictEqual($input.$form.find('.sugg-item').eq(0).text(), 'Canis Major');
				strictEqual($input.$form.find('.sugg-item').eq(1).text(), 'Canis Minor'); 
				start();
				$input.teardown();
			}, 1500);
		});   
	}
	if (window.location.protocol != 'file:' && window.location.href.match(/(\?|&)php\b/)) {
		asyncTest("Suggestions via JSONP", function() {
			var $input = generateInput();
			expect(3);
			var sugg = $input.suggester({
				dataType:'jsonp',
				dataUrl:'./assets/stars-canis-jsonp.php?query=%s&mycallback=%s',
				keyDelay:2
			}).suggester('getInstance');
			sendKeys(sugg, ['C','a','n','i','s'])
			setTimeout(function() {
				strictEqual($input.$form.find('.sugg-item').length, 2);
				strictEqual($input.$form.find('.sugg-item').eq(0).text(), 'Canis Major');
				strictEqual($input.$form.find('.sugg-item').eq(1).text(), 'Canis Minor'); 
				start();
				$input.teardown();
			}, 1500);
		});   
	}
}(jQuery));
