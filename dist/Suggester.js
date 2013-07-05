/*! Suggester - A Better Autocomplete Widget - v1.2.1 - Jul 2013
* https://github.com/kensnyder/jQuery-Suggester
* Copyright (c) 2013 Ken Snyder; Licensed MIT */
(function (factory) {
	// AMD compatibility
	// https://github.com/umdjs/umd/blob/6c10fc0af1e1692cf430c9eb7f530d6b5a5d758b/jqueryPlugin.js
	if (typeof define === 'function' && define.amd) {
		// AMD environment
		define(['jquery'], factory);
	} else {
		// Browser environment
		factory(jQuery);
	}
}(function($) {
	"use strict";
	/**
	 * @module jQuery
	 */
	// get our document once
	var $document = $(document);
	// Our true constructor function. See jQuery.Suggester.prototype.initialize for documentation
	$.Suggester = function() {
		if (arguments[0] === $.Suggester.doSubclass) {
			return;
		}
		this.initialize.apply(this, Array.prototype.slice.call(arguments));
	};
	/**
	 * Default options. Change these to globally change the default options
	 * See {{#crossLink "Suggester/constructor:method"}}constructor{{/crossLink}} for documentation on each option
	 * @property {Object} defaultOptions
	 * @static
	*/
	$.Suggester.defaultOptions = {
		data: false,
		valueProperty: "value",      
		labelProperty: "value",      
		searchProperties: ["value"],
		matchAt: 'anywhere',
		caseSensitive: false,
		dataUrl: false,
		dataType: 'json',
		fly: 'down',
		suggListPosition: 'relative',
		multiselect: true,
		preventDuplicates: true,
		omitAlreadyChosenItems: true,
		minChars: 3,
		keyDelay: 400,
		addOnComma: true,
		addOnTab: true,
		addOnSemicolon: false,
		addOnSubmit: true,
		addOnBlur: true,
		submitOnEnter: false,
		inputSize: 'auto',
		placeholder: '',
		emptyText: '(Type a comma to create a new item)',
		prompt: false,
		maxSuggestions: 10,
		addHiddenInputs: true,
		hiddenName: null,
		hightlightSubstring: true,		
		template:
		'<div class="sugg-widget">' + // this.$widget
			'<ul class="sugg-box">' + // this.$box
				'<li class="sugg-box-item sugg-tag">' + // this.$tagTemplate
					'<span class="sugg-label">TAG TEXT GOES HERE</span><span class="sugg-remove" title="Click to remove">&times;</span>' +
				'</li>' + 
				'<li class="sugg-box-item sugg-input-wrapper">' + // this.$inputWrapper
					'<input type="text" class="sugg-input" value="" autocomplete="off" />' + // this.$input
				'</li>' +
			'</ul>' +
			'<div class="sugg-list-wrapper">' + 
				'<ul class="sugg-list" style="display:none">' + // this.$suggList
					'<li class="sugg-item {record.cssClass}">{record.value}</li>' + // innerHTML is used as this.listItemTemplate unless options.listItemTemplate is set
					'<li class="sugg-empty"></li>' + // this.$empty
					'<li class="sugg-prompt"></li>' + // this.$prompt
				'</ul>' +
			'</div>' +
		'</div>',
		listItemTemplate: null,
		theme: 'coolblue'
	};
	$.Suggester.prototype = {
		/**
		 * The current options. Starts with value given in constructor
		 * @property {Object} options
		 *   @param {Array|Boolean} [options.data=false]  Initial data to use for suggestions
		 *   @param {String} [options.valueProperty="value"]  The name of object property that should be used as the tag's value. Only applicable when options.data is set
		 *   @param {String} [options.labelProperty="value"]  The name of object property that should be used as the tag's display text. Only applicable when options.data is set
		 *   @param {Array} [options.searchProperties=Array("value")]  The array of object property names that should be searched when generating suggestions. Only applicable when options.data is set
		 *   @param {String|Number} [options.matchAt="anywhere"]  Where to match when finding suggestions. It can be "anywhere", "start", "end" or an integer. Only applicable when options.data is set
		 *   @param {Boolean} [options.caseSensitive=false]  If true, find matches regardless of case. Only applicable when options.data is set. Only applicable when options.data is set
		 *   @param {String} [options.dataUrl=false]  Url to call to get json or jsonp results. Use %s to indicate where search text should be inserted. e.g. "http://example.com/myjson?query=%s" or "http://example.com/myjsonp?query=%s&callback=%s"
		 *   @param {String} [options.dataType="json"]  Can be "json" or "jsonp". If json, options.dataUrl needs to be in the format "http://example.com/myjsonp?query=%s&mycallback=%s". To handle xml, you'll need to register BeforeFetch and AfterFetch handlers or overwrite the fetchResults method
		 *   @param {String} [options.fly="down"]  Which way should the suggestion box fly. If "up", the suggestion box will appear before the input box in the DOM tree. A css class of "sugg-fly-up" or "sugg-fly-down" is applied to the widget element based on this value
		 *   @params {String} [options.suggListPosition="relative"]  If "absolute", the suggestion box will be appended to <body> and positioned and sized each time it is opened. This is useful for widgets within table elements
		 *   @param {Boolean} [options.multiselect=true]  If true, allow multiple tags
		 *   @param {Boolean} [options.preventDuplicates=true]  If true, the first tag will be removed when a duplicate is typed in
		 *   @param {Boolean} [options.omitAlreadyChosenItems=true]  If true, don't suggest items that have already been chosen as tags. Only applicable when options.data is set
		 *   @param {Number} [options.minChars=3]  The minimum number of characters a user must type before the suggestion box will appear. If 0, show choices when input is simply focused (like a faux select widget)
		 *   @param {Number} [options.keyDelay=400]  The number of milliseconds between keystrokes before the suggestion lookup begins
		 *   @param {Boolean} [options.addOnComma=true]  If true, typing a comma will add the current text as a tag
		 *   @param {Boolean} [options.addOnTab=true]  If true, typing a tab will add the current text as a tag
		 *   @param {Boolean} [options.addOnSemicolon=false]  If true, typing a semicolon will add the current text as a tag
		 *   @param {Boolean} [options.addOnSubmit=true]  If true, add tag on submit if user has entered text but not typed comma or tab
		 *   @param {Boolean} [options.addOnBlur=true]  If true, add tag on blur if user has entered text but not typed comma or tab
		 *   @param {Boolean} [options.submitOnEnter=false]  If false, prevent the form from submitting when the user presses enter on the empty input
		 *   @param {String} [options.inputSize=auto]  Manually set the input size property to a certain width. If auto, set size to text width
		 *   @param {String} [options.placeholder]  Placeholder text to display when no tags are present. e.g. "Enter tags..."
		 *   @param {String} [options.emptyText]  Message to show when there are no suggestions - default is "(Type a comma to create a new item)"
		 *   @param {String} [options.prompt]  Message to display in suggestion list when below min char length
		 *   @param {Number} [options.maxSuggestions=10]  Only display this many suggestions
		 *   @param {Boolean} [options.addHiddenInputs=true]  If true, also add a hidden input for each tag (fieldname_tag[]) for easier server-side processing (See options.hiddenName to create a custom name)
		 *   @param {String} [options.hiddenName]  The name to use for hidden elements (defaults to the original input's name plus "_tags[]")
		 *   @param {Boolean} [options.highlightSubstring=true]  If true, wrap first matching substring in each suggestion with <strong class="sugg-match"></strong>
		 *   @param {String} [options.template]  The html used to generate the widget. You can add more markup, change tag names, or add css classes, but all the sugg-* classes need to remain. See below for default.
	
	<div class="sugg-widget"> <!-- this.$widget -->		
		<ul class="sugg-box"> <!-- this.$box -->
			<li class="sugg-box-item sugg-tag">  <!-- this.$tagTemplate -->
				<span class="sugg-label">TAG TEXT GOES HERE</span><span class="sugg-remove" title="Click to remove">&times;</span>
			</li>
			<li class="sugg-box-item sugg-input-wrapper"> <!-- this.$inputWrapper -->
				<input type="text" class="sugg-input" value="" autocomplete="off" /> <!-- this.$input -->
			</li>
		</ul>
		<div class="sugg-list-wrapper">
			<ul class="sugg-list" style="display:none"> <!-- this.$suggList -->
				<li class="sugg-item {record.cssClass}">{record.value}</li> <!-- innerHTML is used as this.listItemTemplate unless options.listItemTemplate is set -->
				<li class="sugg-empty"></li> <!-- this.$empty -->
				<li class="sugg-prompt"></li> <!-- this.$prompt -->
			</ul>
		</div>
	</div>
		
		 *   @param {String} [options.listItemTemplate] Override the .sugg-item element in options.template
		 *   @param {String} [options.theme="coolblue"]  The css class to add to widget (e.g. "sugg-theme-coolblue"). The following themes come predefined in the CSS: "coolblue", "faceblue", "graybox", "grayred"
		 *   @param {Function} [options.onInitialize]  Add a {{#crossLink "Suggester/Initialize:event"}}Initialize event{{/crossLink}}
		 *   @param {Function} [options.onChange]  Add a {{#crossLink "Suggester/Change:event"}}Change event{{/crossLink}}
		 *   @param {Function} [options.onBeforeAdd]  Add a {{#crossLink "Suggester/BeforeAdd:event"}}BeforeAdd event{{/crossLink}}
		 *   @param {Function} [options.onBeforeAjax]  Add a {{#crossLink "Suggester/BeforeAjax:event"}}BeforeAjax event{{/crossLink}}
		 *   @param {Function} [options.onBeforeClose]  Add a {{#crossLink "Suggester/BeforeClose:event"}}BeforeClose event{{/crossLink}}
		 *   @param {Function} [options.onBeforeFetch]  Add a {{#crossLink "Suggester/BeforeFetch:event"}}BeforeFetch event{{/crossLink}}
		 *   @param {Function} [options.onBeforeFilter]  Add a {{#crossLink "Suggester/BeforeFilter:event"}}BeforeFilter event{{/crossLink}}
		 *   @param {Function} [options.onBeforeFormat]  Add a {{#crossLink "Suggester/BeforeFormat:event"}}BeforeFormat event{{/crossLink}}
		 *   @param {Function} [options.onBeforeHandleKey]  Add a {{#crossLink "Suggester/BeforeHandleKey:event"}}BeforeHandleKey event{{/crossLink}}
		 *   @param {Function} [options.onBeforeMove]  Add a {{#crossLink "Suggester/BeforeMove:event"}}BeforeMove event{{/crossLink}}
		 *   @param {Function} [options.onBeforeOpen]  Add a {{#crossLink "Suggester/BeforeOpen:event"}}BeforeOpen event{{/crossLink}}
		 *   @param {Function} [options.onBeforeRemove]  Add a {{#crossLink "Suggester/BeforeRemove:event"}}BeforeRemove event{{/crossLink}}
		 *   @param {Function} [options.onBeforeRender]  Add a {{#crossLink "Suggester/BeforeRender:event"}}BeforeRender event{{/crossLink}}
		 *   @param {Function} [options.onBeforeSave]  Add a {{#crossLink "Suggester/BeforeSave:event"}}BeforeSave event{{/crossLink}}
		 *   @param {Function} [options.onBeforeSubmit]  Add a {{#crossLink "Suggester/BeforeSubmit:event"}}BeforeSubmit event{{/crossLink}}
		 *   @param {Function} [options.onBeforeSuggest]  Add a {{#crossLink "Suggester/BeforeSuggest:event"}}BeforeSuggest event{{/crossLink}}
		 *   @param {Function} [options.onAfterAdd]  Add a {{#crossLink "Suggester/AfterAdd:event"}}AfterAdd event{{/crossLink}}
		 *   @param {Function} [options.onAfterAjax]  Add a {{#crossLink "Suggester/AfterAjax:event"}}AfterAjax event{{/crossLink}}
		 *   @param {Function} [options.onAfterClose]  Add a {{#crossLink "Suggester/AfterClose:event"}}AfterClose event{{/crossLink}}
		 *   @param {Function} [options.onAfterFetch]  Add a {{#crossLink "Suggester/AfterFetch:event"}}AfterFetch event{{/crossLink}}
		 *   @param {Function} [options.onAfterFilter]  Add a {{#crossLink "Suggester/AfterFilter:event"}}AfterFilter event{{/crossLink}}
		 *   @param {Function} [options.onAfterFormat]  Add a {{#crossLink "Suggester/AfterFormat:event"}}AfterFormat event{{/crossLink}}
		 *   @param {Function} [options.onAfterHandleKey]  Add a {{#crossLink "Suggester/AfterHandleKey:event"}}AfterHandleKey event{{/crossLink}}
		 *   @param {Function} [options.onAfterMove]  Add a {{#crossLink "Suggester/AfterMove:event"}}AfterMove event{{/crossLink}}
		 *   @param {Function} [options.onAfterOpen]  Add a {{#crossLink "Suggester/AfterOpen:event"}}AfterOpen event{{/crossLink}}
		 *   @param {Function} [options.onAfterRemove]  Add a {{#crossLink "Suggester/AfterRemove:event"}}AfterRemove event{{/crossLink}}
		 *   @param {Function} [options.onAfterSave]  Add a {{#crossLink "Suggester/AfterSave:event"}}AfterSave event{{/crossLink}}
		 *   @param {Function} [options.onAfterSuggest]  Add a {{#crossLink "Suggester/AfterSuggest:event"}}AfterSuggest event{{/crossLink}}
		 *   @example
	
	// EXAMPLE TEMPLATE CONFIG		
	// change uls to divs and lis to spans
	options.template = $.Suggester.defaultOptions.template
		.replace(/<(\/)?ul/g, '<$1div')
		.replace(/<(\/)?li/g, '<$1span')
	;
	// custom list item template
	options.listItemTemplate = '<li class="sugg-item">{record.lname}, {record.fname} ({record.email})</li>';	
	
		 */
		/**
		 * The input used to make the widget
		 * @property {jQuery} $originalInput
		 */		
		/**
		 * Array of static data used instead of an ajax call
		 * @property {Object[]} data 
		 */
		/**
		 * An array of Suggester.Tag objects
		 * @property {Suggester.Tag[]} tags
		 */
		/**
		 * The name to use for hidden elements (defaults to the original input's name plus "_tags[]")
		 * @property {String} hiddenName
		 */
		/**
		 * The tag that is selected for deletion
		 * @property {jQuery} $focusedTag
		 */
		/**
		 * The item currently selected in the suggestion box
		 * @property {jQuery} $currentItem
		 */
		/**
		 * The publish and subscribe handle - equal to $(this)
		 * @property {jQuery} pubsub
		 */
		/**
		 * The element that wraps the widget
		 * @property {jQuery} $widget
		 */
		/**
		 * The container that holds the chosen tags
		 * @property {jQuery} $box
		 */
		/**
		 * The tag element that is cloned to make new tags
		 * @property {jQuery} $tagTemplate
		 */
		/**
		 * The input that users type in
		 * @property {jQuery} $input
		 */
		/**
		 * The container for the input
		 * @property {jQuery} $inputWrapper
		 */
		/**
		 * The suggestion list element
		 * @property {jQuery} $suggList
		 */
		/**
		 * The element that is positioned relatively to hold the absolutely positioned suggestion list
		 * @property {jQuery} $suggListWrapper
		 */
		/**
		 * The element enclosing the empty text
		 * @property {jQuery} $empty
		 */
		/**
		 * The element enclosing the prompt
		 * @property {jQuery} $prompt
		 */
		/**
		 * The html to use for suggestion list items
		 * @property {String} listItemTemplate
		 */
		/**
		 * The search term we are currently searching for
		 * @property {String} _searchTerm
		 */
		/**
		 * The text in the input box that will be used to fetch results (i.e. what the user just typed)
		 * @property {String} _text
		 */
		/**
		 * The jQuery XHR object used initilized for fetching data - http://api.jquery.com/jQuery.ajax/#jqXHR
		 * @property {jqXHR} _jqXHR
		 */
		/**
		 * @class Suggester
		 * @constructor
		 * @example

	// Instantiate the OOP way
	var instance = new $.Suggester('selector', options)
		
	// Instantiate the jQuery way
	$('selector').suggester(options);
	// call methods on the instance
	$('selector').suggester('method', arg1, arg2);
	// initialize and get back instance
	var instance = $('selector').suggester('getInstance');

		 * @param {String|jQuery|HTMLElement} $textInput  The input element to convert into a widget
		 * @param {Object} [options=Suggester.defaultOptions] See {{#crossLink "Suggester/options:property"}}options property{{/crossLink}} for full documentation
		 */
		initialize: function($textInput, options) {
			// This is the original text input given
			this.$originalInput = $($textInput);
			this.$form = $(this.$originalInput.prop('form'));
			// Bail because original input already has an instance .data('SuggesterInstance')
			if (this.$originalInput.data('SuggesterInstance')) {
				return this;
			}
			// register our instance
			$.Suggester.instances.push(this);
			if (this.$originalInput.length === 0) {
				// no input found. User could explicitly call initialize later
				// if not, there will likely be errors
				return this;
			}
			// TODO: allow input to be a select
			// our options are default options plus given options
			this._processOptions(options);
			// the preloaded list of suggestion records
			this.setData(this.options.data || []);    
			// a collection of tags and tag data
			this.tags = [];
			// the name given to the hidden $input elements
			this.hiddenName = this.options.hiddenName || this.$originalInput.attr('name') + '_tags[]';
			// the tag that is clicked to prepare for deletion
			this.$focusedTag = false;
			// the currently selected suggestion
			this.$currentItem = false;
			// setup our pubsub system
			this._setupPubsub();
			// render our widget
			this._render();
			// setup event handlers
			this._setupListeners();
			// we're all done
			/**
			 * Called after widget is initialized and rendered
			 * @event Initialize
			 */			
			this.publish('Initialize');
			return this;
		},
		/**
		 * Completely remove Suggester widget and replace with original input box (with values populated)
		 * @method destroy
		 * @param {Object} [options]
		 *    @param {Boolean} [options.keepHiddenInputs=false]  If true, append all hidden inputs after the original input
		 * @return {jQuery}  The original input
		 */
		destroy: function(options) {
			options = options || {};
			// "un"-render; this.$originalInput should be already populated
			this.$originalInput.insertBefore(this.$widget).show();
			this.$originalInput.removeData('SuggesterInstance');
			if (options.keepHiddenInputs) {
				this.$widget.find('input[type=hidden]').insertBefore(this.$widget);
			}
			this.tags = [];
			this.data = [];
			this.$widget.empty().remove();
			// unregister our instance
			var sugg = this;
			$.each($.Suggester.instances, function(i) {
				if (sugg === this) {
					$.Suggester.instances.splice(i, 1);
					return false;
				}
			});
			return this.$originalInput;
		},    
		/**
		 * Add a tag by a record
		 * @method add
		 * @param {String} value  the tag to add
		 * @param {String} [label=value]  the text to display in the new tag
		 * @param {jQuery} [$item]  Set internally when the record is added by choosing from the suggestion box
		 * @return {jQuery} The jQuery object containing the newly created label or undefined if one was not created
		 *
		 */
		add: function(value, label/*optional*/, $item/*optional*/) {
			var evt, idx, $hidden, $tag, record;
			// with only one argument, look for a matching record
			if (arguments.length == 1) {
				record = this.searchData(value, this.options.valueProperty === this.options.labelProperty ? [this.options.valueProperty] : [this.options.valueProperty,this.options.labelProperty]);
				if (record) {
					value = record[this.options.valueProperty];
					label = record[this.options.labelProperty];
				}
			}
			else if ($item) {
				record = $item.data('tag-record');
				if (record) {
					value = record[this.options.valueProperty];
					label = record[this.options.labelProperty];
				}
			}
			if (typeof label != 'string') {
				label = value;
			}
			if (typeof value != 'string') {
				value = label;
			}
			/**
			 * Fired before a tag is added
			 * @event BeforeAdd
			 * @param {String} value  The tag to be added (writeable)
			 * @param {String} label  The value of the tag to be added (writeable)
			 * @param {jQuery} item  The suggestion that was chosen, if any (writeable)
			 * @param {Object} record  The record that was chosen, if any (writeable)
			 * @ifprevented  The tag is not added
			 * @example       
			 
	instance.bind('BeforeAdd', function(event) {
		if (isSwearWord(evt.value)) {
			event.preventDefault();
			alert('Tags cannot be swear words');
		}
	});
			 */
			evt = this.publish('BeforeAdd', {
				value: value,
				label: label,
				item: $item,
				record: record
			});
			if (evt.isDefaultPrevented()) {
				return undefined;
			}
			if (this.options.preventDuplicates) {       
				idx = this.getTagIndex(value);
				if (idx > -1) {
					// duplicate: remove old and continue to add new so that new one will be at the end
					this._spliceTagByIdx(idx);
				}
			}
			// append our hidden input to the widget
			if (this.options.addHiddenInputs) {
				$hidden = $('<input type="hidden" />').attr('name', this.hiddenName).val(evt.value);
				this.$widget.append($hidden);
			}
			$tag = this.$tagTemplate.clone().data('tag-value', evt.value).data('tag-label', evt.label);
			// keep a full record of our chosen tag
			this.tags.push(new $.Suggester.Tag({
				suggester: this,
				index: this.tags.length, 
				$tag: $tag, 
				$hidden: $hidden,
				value: evt.value,
				label: evt.label
			}));
			// set the label's display text
			if (this.options.multiselect) {
				$tag.find('.sugg-label').text(evt.label);
				this.$inputWrapper.before($tag);
			}
			else {
				this.$input.val(evt.value);
			}
			// set the value of the original input
			this.save();      
			/**
			 * Allows you to take action after a tag is added
			 * @event AfterAdd
			 * @param {jQuery} item    The suggestion that was chosen, if any
			 * @param {jQuery} tag     The jQuery element of the tag that was added
			 * @param {jQuery} hidden  The hidden input that was generated
			 * @param {String} value   The value of the tag
			 * @param {String} label   The the label of the tag
			 * @param {String} record  The record that was chosen, if any
			 * @example
			 
	instance.bind('AfterAdd', function(event) {
		// fade in tag
		event.tag.fadeIn(500);
	});
			 */
			this.publish('AfterAdd', {
				item: evt.item,
				tag: $tag,
				hidden: $hidden,
				value: evt.value,
				label: evt.label,
				record: evt.record
			});
			return $tag;
		},
		/**
		 * Add a tag with the contents of the input; e.g. when the user has typed something but clicks on another part of the form
		 * Note: this happens on blur when this.options.addOnBlur is true
		 * @method addCurrentBuffer
		 */
		addCurrentBuffer: function() {
			var inputVal = $.trim(this.$input.val());
			if (inputVal !== this.options.placeholder && inputVal !== '') {
				this.add(inputVal);
				this.$input.val('');
			}     
		},
		/**
		 * Move the selection up or down in the suggestion box
		 * @method moveSelection
		 * @param {String} [direction=up]  Either "up" or "down"
		 */
		moveSelection: function(direction) {
			// find all the suggestion items
			var $items = this.$suggList.find('.sugg-item');
			var $nextItem;
			if (this.$currentItem && this.$currentItem.length) {        
				// if we already selected an item, go next or previous
				$nextItem = (direction == 'down' ? this.$currentItem.next() : this.$currentItem.prev());
			}
			else {
				// otherwise go to first or last item
				$nextItem = (direction == 'down' ? $items.first() : $items.last());
			}
			/**
			 * Fire in response to up or down arrow while suggestion list is focused
			 * @event BeforeMove
			 * @param {String} direction  "up" or "down"
			 * @param {jQuery|null} current    jQuery object with the currently selected item or null if there isn't one (writeable)
			 * @param {jQuery|null} next       jQuery object with the item that will be selected next (writeable)
			 * @ifprevented  Movement is cancelled
			 * @example

	instance.bind('BeforeMove', function(event) {
		alert('The new selection will be ' + event.next.text());
	});
			
			 */
			var evt = this.publish('BeforeMove', {
				direction: direction,
				current: this.$currentItem,
				next: $nextItem, 
				cancelable:true
			});
			// allow BeforeMove callbacks to cancel movement
			if (evt.isDefaultPrevented()) {
				return this;
			}
			// deselect current item
			if (evt.current && evt.current.length) {
				this.deselectItem(evt.current);
			}
			// move to next item
			if (evt.next && evt.next.length) {
				this.selectItem(evt.next);
			}
			// reset our current items
			this.$currentItem = evt.next;
			/**
			 * Fired after selected suggestion is changed in response to up or down arrow
			 * @event AfterMove
			 * @param {String} direction  "up" or "down"
			 * @param {jQuery|null} last       The previously selected item
			 * @param {jQuery} current    The newly selected item
			 * @example
	
	instance.bind('AfterMove', function(event) {
		alert('The new selection is ' + event.current.text());
	});
			
			 */
			this.publish('AfterMove', {
				direction: direction,
				last: evt.current,
				current: this.$currentItem
			});
			return this;
		},
		/**
		 * Select a suggestion
		 * @method selectItem
		 * @param {jQuery} $tag
		 * @return {Suggester}
		 */
		selectItem: function($tag) {
			$tag.addClass('sugg-selected');
			return this;
		},
		/**
		 * Deselect a suggestion
		 * @method deselectItem
		 * @param {jQuery} $tag
		 * @return {Suggester}
		 */   
		deselectItem: function($tag) {
			$tag.removeClass('sugg-selected');
			return this;
		},
		/**
		 * Deselect all suggestions
		 * @method deselectAllItems
		 * @return {Suggester}
		 */     
		deselectAllItems: function() {
			this.$suggList.find('.sugg-item').removeClass('sugg-selected');
			this.$currentItem = null; 
			return this;
		},
		/**
		 * Open suggestion list for the given text
		 * @method suggest
		 * @param {String} text
		 * @return {Suggester}
		 */
		suggest: function(text) {
			this._text = text;
			if (this.options.dataUrl) {
				this.fetchResults(text);
			}
			else {
				this.handleSuggestions(this.getResults(text));
			}
		},
		/**
		 * Add more data records to the autosuggest list. Does not apply when dataUrl is set
		 * @method addData
		 * @params {Object[]} data  More records in the same object format as initially set
		 * @return {Suggester}
		 */
		addData: function(data) {     
			var i, len, record;
			if (data.length > 0 && typeof data[0] != 'object') {
				for (i = 0, len = data.length; i < len; i++) {
					record = {};
					record[this.options.valueProperty] = ''+data[i];
					this.data.push(record);
				}
			}
			else {
				this.data = this.data.concat(data);     
			}
			return this;
		},
		/**
		 * Set data records to the autosuggest list. Does not apply when dataUrl is set
		 * @method setData
		 * @params {Object[]} data
		 * @return {Suggester}
		 */   
		setData: function(data) {
			this.data = [];
			this.addData(data);
			return this;
		},
		/**
		 * Get all the records in the autosuggest list. Does not apply when dataUrl is set
		 * @method getData
		 * @return {Object[]}
		 */   
		getData: function() {
			return this.data;
		},
		/**
		 * Set the direction of the suggestion menu, to fly upwards or downwards
		 * @method setFlyDirection
		 * @param {String} direction  either "up" or "down"
		 * @return {Suggester}
		 */
		setFlyDirection: function(direction) {
			// if the suggestion list should fly upwards instead of downwards, put the suggestion list before the input container in the dom tree
			if (direction == 'up') {
				this.$suggListWrapper.insertBefore(this.$box);
				this.$widget.removeClass('sugg-fly-down').addClass('sugg-fly-up');
			}
			else if (direction == 'down') {
				this.$suggListWrapper.insertAfter(this.$box);
				this.$widget.addClass('sugg-fly-down').removeClass('sugg-fly-up');
			}
			// TODO: support auto by checking window scroll position
			return this;
		},
		/**
		 * Focus on a previously added tag
		 * @method focusTag
		 * @params {jQuery} $tag  The .sugg-tag element to focus
		 * @return {Suggester}
		 */
		focusTag: function($tag) {
			this.unfocusTag();
			this.$focusedTag = $tag.addClass('sugg-focused');
			// remove tag if user presses delete or backspace
			$document.keydown(this.removeFocusedTag).click(this.unfocusTag);
			return this;
		},
		/**
		 * Unfocus the previously focussed tag
		 * @method unfocusTag
		 * @return {Suggester}
		 */
		unfocusTag: function() {
			$document.unbind('keydown', this.removeFocusedTag).unbind('click', this.unfocusTag);
			if (this.$focusedTag) {
				this.$focusedTag.removeClass('sugg-focused');
			}
			this.$focusedTag = null;
			return this;
		},
		/**
		 * Remove the focused tag
		 * @method removeFocusedTag
		 * @param {jQuery.Event} evt (optional)  Used to check if $document keypress is backspace or delete
		 * @return {Suggester}
		 */
		removeFocusedTag: function(evt) {
			if (evt && evt.which && (evt.which == 8 || evt.which == 46)) {
				// delete or backspace key                
				if (this.$focusedTag) {
					this.remove(this.$focusedTag);
				}
				evt.preventDefault();
			} 
			this.unfocusTag();
			return this;
		},
		/**
		 * Remove a tag given its text or jQuery element or HTML element
		 * @method remove
		 * @param {String|jQuery|HTMLElement} $tag  the tag to remove
		 * @return {Suggester}
		 * @chainable
		 */
		remove: function($tag) {
			var evt, value, label, removed;
			if (typeof $tag.nodeType == 'number' && typeof $tag.style == 'object') {
				// DOM Element
				$tag = $($tag);
			}
			if ($tag instanceof $) {
				// jQuery object
				value = $tag.data('tag-value');
			}
			else {
				// String
				value = $tag;
				$tag = false;
				for (var i = 0, len = this.tags.length; i < len; i++) {
					if (value == this.tags[i].getValue() || value == this.tags[i].getLabel()) {
						$tag = this.tags[i].getElement();
						break;
					}
				}
				if (!$tag) {
					return this;
				}
			}
			label = $tag.data('tag-label');
			/**
			 * Fired before a tag is removed
			 * @event BeforeRemove
			 * @param {jQuery} tag  The tag to be removed
			 * @param {String} value  The value of the tag to be removed (writeable)
			 * @param {String} label  The label of the tag to be removed
			 * @ifprevented The tag will not be removed
			 * @example
			 
	instance.bind('BeforeRemove', function(event) {
		if (!confirm('Are you sure you want to remove the tag "' + event.label + '"?')) {
			event.preventDefault();
		}
	});
			 
			 */
			evt = this.publish('BeforeRemove', {
				tag: $tag,
				value: value,
				label: label,
				cancelable: true
			});
			if (evt.isDefaultPrevented()) {
				return this;
			}     
			removed = this._spliceTag(evt.value);
			// save to our hidden input
			this.save();
			/**
			 * Fired after a tag is removed
			 * @event AfterRemove
			 * @param {jQuery} tag  The tag element that was removed
			 * @param {String} value  The value of the tag that was removed
			 * @param {String} label  The label of the tag that was removed
			 * @param {Suggester.Tag}  The tag object that was removed
			 */			
			this.publish('AfterRemove', {
				tag: $tag,
				value: evt.value,
				label: label,
				removed: removed
			});
			return this;
		},
		/**
		 * Find a suggestion record by text. Only applies when this.options.data is set.
		 * @method findRecord
		 * @param {String} text  The text to search for
		 * @return {Object|false}  The matched record object or false if nothing matched.
		 */   
		findRecord: function(text) {
			return this.searchData(text, this.options.searchProperties); 
		}, 
		/**
		 * Search through this.data to find a record with a value or label equal to the given value
		 * @method searchData
		 * @param {String} value  The value or label to find
		 * @param {Array} props  An array of strings of property names to search
		 * @return {Object|Boolean}  Returns the record if found, false if not found
		 */
		searchData: function(value, props) {
			var i, len, j, numProps, prop;
			var data = this.getData();
			len = data.length;
			numProps = props.length;
			if (len === 0 || numProps === 0) {
				return false;
			}
			// ensure value is a string
			value = '' + value;
			// optimize for case when value there is only one property
			if (numProps == 1) {
				prop = props[0];
				// run through each record
				if (this.options.caseSensitive) {
					for (i = 0; i < len; i++) {
						if (data[i][prop] === value) {
							return data[i];
						}
					}
				} else {
					value = value.toLowerCase();
					for (i = 0; i < len; i++) {
						// check the value lowercase property
						if (typeof data[i][prop] == 'string' && data[i][prop].toLowerCase() === value) {
							return data[i];
						}
					}
				}
			}
			else {
				// run through each record and each property			
				if (this.options.caseSensitive) {
					for (i = 0; i < len; i++) {
						for (j = 0; j < numProps; j++) {						
							if (data[i][ props[j] ] === value) {
								return data[i];
							}
						}
					}
				} else {
					value = value.toLowerCase();
					for (i = 0; i < len; i++) {
						for (j = 0; j < numProps; j++) {						
							if (typeof data[i][ props[j] ] == 'string' && data[i][ props[j] ].toLowerCase() === value) {
								return data[i];
							}
						}						
					}
				}				
			}
			return false;
		},
		/**
		 * Initiate suggestion process if the input text is >= this.options.minChars, otherwise show prompt
		 * @method suggestIfNeeded
		 * @return {Suggester}
		 * @chainable
		 */
		suggestIfNeeded: function() {
			var text = this.$input.val();
			if (text.length >= this.options.minChars) {       
				this.suggest(text);
			}
			else if (this.options.prompt) {
				this.showPrompt();
			}
			else {
				this.closeSuggestBox();
			}     
			return this;
		},
		/**
		 * Show the prompt text to give a hint to users. Only called when there are no items and this.options.prompt is truthy
		 * @method showPrompt
		 * @return {Suggester}
		 */
		showPrompt: function() {
			if (!this.$prompt) {
				return this;
			}
			this.$suggList.html('').append(this.$prompt);
			this.openSuggestBox();
			this.$widget.addClass('sugg-prompt-shown');
			return this;
		},
		/**
		 * Show text indicating there are no suggestions - defined in this.options.emptyText
		 * @method showEmptyText
		 * @return {Suggester}
		 * @chainable
		 */   
		showEmptyText: function() {
			this.$suggList.html('');
			if (!!this.options.emptyText) {
				this.$empty.html(this.options.emptyText).appendTo(this.$suggList);
				this.openSuggestBox();
				this.$widget.addClass('sugg-empty-shown');				
			}
			else {
				this.closeSuggestBox();				
			}
			return this;
		},
		/**
		 * Fetch suggestions from an ajax URL
		 * @method fetchResults
		 * @param {String} text  The text to search for
		 * @return {jqXHR}  The jQuery XHR transport that is fetching the data
		 */
		fetchResults: function(text) {
			this._searchTerm = text;
			var settings = {
				context: this,
				url: this.options.dataUrl.replace('%s', text)
			};
			if (this.options.dataType.toLowerCase() == 'json') {
				settings.dataType = 'json';
			}
			else if (this.options.dataType.toLowerCase() == 'jsonp') {
				settings.dataType = 'jsonp';
				// jQuery replaces second question mark with callback name
				settings.url = settings.url.replace('%s', '?');
			}
			else {
				throw new Error('jQuery.Suggester#fetchResults: options.dataType must be "json" or "jsonp".');
			}
			/**
			 * Edit settings before ajax request is sent
			 * @event BeforeAjax
			 * @param {Object} settings  Settings sent to $.ajax()
			 * @param {String} term  The term for which we will search
			 * @ifcancelled  Ajax is not run and this._afterFetch is run
			 * @example
			 
	instance.bind('BeforeAjax', function(event) {
		event.settings.timeout = 5000;
		startSpinner(event.term);
	});			 
			 
			 */
			var evt = this.publish('BeforeAjax', {
				settings: settings,
				term: text,
				cancelable: true
			});
			if (evt.isDefaultPrevented()) {
				this._afterFetch(evt.records || []);
				return false;
			}
			evt.settings.beforeSend = this._beforeFetch;
			var jqXHR = $.ajax(evt.settings).done(this._afterFetch);
			/**
			 * Access the jqXHR after initiating the ajax call but before it returns
			 * @event AfterAjax
			 * @param {Object} settings  Settings sent to $.ajax()
			 * @param {String} term  The term which was searched
			 * @param {jqXHR} jqXHR  The jquery XMLHttpRequest object
			 * @example
			 
	instance.bind('AfterAjax', function(event) {
		event.jqXHR.done(stopSpinner);	
	});
			 
			 */
			this.publish('AfterAjax', {
				settings: evt.settings,
				term: evt.term,
				jqXHR: jqXHR
			});
			return jqXHR;
		},
		/**
		 * Cancel the XHR. Used when user starts typing again before XHR completes
		 * @method abortFetch
		 * @return {Suggester}
		 * @chainable
		 */
		abortFetch: function() {
			if (this._jqXHR) {
				this._jqXHR.abort();
			}
			return this;
		},
		/**
		 * Take the given records and build and display suggestion box. Usually only called internally.
		 * @method handleSuggestions
		 * @param {Array} records  The result records to use to build the suggestion list
		 * @return {Suggester}
		 * @chainable
		 */
		handleSuggestions: function(records) {
			if (!records || records.length === 0) {
				this.showEmptyText();
				return this;
			}
			var $suggestion;
			// clear out the suggestion list including all nodes and data
			this.$suggList.empty();
			for (var i = 0, len = records.length; i < len; i++) {
				$suggestion = $(this._formatSuggestion(records[i], this._text));
				$suggestion.data('tag-record', records[i]);
				this.$suggList.append($suggestion);
			}
			/**
			 * Modify suggestion box behavior before it opens
			 * @event BeforeSuggest
			 * @param {String} text  The text that was searched for
			 * @ifprevented  The suggestion list is built but not displayed
			 * @example

	instance.bind('BeforeSuggest', function(event) {
		if (evt.text == 'dont suggest') {
			event.preventDefault(); // suggest box will not open
		}
	});

			*/			
			var evt = this.publish('BeforeSuggest', {
				text: this._text,
				cancelable: true
			});
			if (evt.isDefaultPrevented()) {
				return this;
			}
			this.openSuggestBox();
			/**
			 * Fires after displaying suggestions
			 * @event AfterSuggest
			 */			
			this.publish('AfterSuggest');
			return this;
		},
		/**
		 * Return true if suggestion box is open
		 * @method isSuggestBoxOpen
		 * @return {Boolean}
		 */
		isSuggestBoxOpen: function() {
			return this.$suggList.css('display') != 'none';
		},
		/**
		 * Manually open the suggestion box in whatever state it is. Usually only called internally.
		 * @method openSuggestBox
		 * @return {Suggester}
		 * @chainable
		 */
		openSuggestBox: function() {      
			var evt, bodyOffset, width, height, pos, top, left, sugg = this;
			if (this.options.suggListPosition == 'absolute') {
				bodyOffset = $(document.body).offset();
				pos = this.$box.position();
				if (this.options.fly == 'up') {
					// we have to show but set visibility to hidden so that we can get the outerHeight
					this.$suggList.css('visibility','hidden').show();
					top = pos.top - bodyOffset.top - this.$box.outerHeight() + this.$box.height() - this.$suggList.outerHeight();
					this.$suggList.hide().css('visibility','visible');
				}
				else {
					top = pos.top - bodyOffset.top + this.$box.outerHeight();
				}
				left = pos.left - bodyOffset.left;
				width = this.$box.outerWidth();
				this.$suggList.css({
					top: top+'px',
					left: left+'px',
					width: width
				});   
			}
			/**
			 * Fires before suggestion box is displayed
			 * @event BeforeOpen
			 * @ifprevented  Box is not displayed
			 */			
			evt = this.publish('BeforeOpen', {
				cancelable: true
			});     
			if (evt.isDefaultPrevented()) {
				return this;
			}
			this.$widget
			.addClass('sugg-list-open')
			.removeClass('sugg-prompt-shown')
			.removeClass('sugg-empty-shown');
			setTimeout(function() {       
				$document.bind('click', sugg._closeOnOutsideClick);
			}, 0);
			this.$suggList.show();
			/**
			 * Fires after suggestion box is displayed
			 * @event AfterOpen
			 */			
			this.publish('AfterOpen');
			return this;      
		},
		/**
		 * Hide the suggestion box
		 * @method closeSuggestBox
		 * @return {Suggester}
		 * @chainable
		 */
		closeSuggestBox: function() {
			$document.unbind('click', this._closeOnOutsideClick);
			/**
			 * Fired before suggestion box is hidden
			 * @event BeforeClose
			 * @ifprevented  Suggestion box will stay open
			 */
			var evt = this.publish('BeforeClose', {
				cancelable:true
			});
			if (!evt.isDefaultPrevented()) {
				this.$suggList.hide();
				this.$widget.removeClass('sugg-list-open');
			}
			/**
			 * Fired after suggestion box is hidden
			 * @event AfterClose
			 */			
			this.publish('AfterClose');
			return this;
		},
		/**
		 * Focus cursor on text input box
		 * @method focus
		 * @return {Suggester}
		 * @chainable
		 */
		focus: function() {
			// use the dom method to focus
			this.$input[0].focus();
			return this;
		},
		/**
		 * Get suggestion result records given some text (local data)
		 * @method getResults
		 * @param {String} text  Gather suggestions based on this text
		 * @return {Array}  Array of Objects of matching records 
		 */
		getResults: function(text) {
			text = ''+text;
			/**
			 * Called before the search for results
			 * @event BeforeFilter
			 * @param {String} text  The text to search for
			 * @example

	instance.bind('BeforeFilter', function(event) {
		// remove all special characters from input text
		event.text = event.text.replace(/[^\w ]/g, '');
	});

			 */
			var evt = this.publish('BeforeFilter', {
				text: text
			});     
			if (!this.options.caseSensitive) {
				var casedText = evt.text.toLowerCase();
			}     
			var sugg = this;
			var results = [];
			$.each(this.getData(), function(i, record) {        
				if (sugg.options.omitAlreadyChosenItems && sugg.getTagIndex(record[sugg.options.valueProperty]) > -1) {
					// tag already exists so don't suggest it
					// skip loop
					return;
				}
				$.each(sugg.options.searchProperties, function() {          
					var value = '' + (record[this] || '');
					if (!sugg.options.caseSensitive) {
						value = value.toLowerCase();
					}         
					if (
						(sugg.options.matchAt == 'anywhere' && value.indexOf(casedText) > -1) ||
						(value.indexOf(casedText) == sugg.options.matchAt) ||
						(sugg.options.matchAt == 'end' && value.indexOf(casedText) == value.length - casedText-length) 
						) {
						results.push(record);
						return false;
					}
				});
				if (sugg.options.maxSuggestions > 0 && results.length >= sugg.options.maxSuggestions) {
					// exit the loop
					return false;
				}
			});
			/**
			 * Called after the search for results
			 * @event AfterFilter
			 * @param {String} text  The that was searched for
			 * @param {Array} results  The array of records that matched (writeable)
			 * @example

	instance.bind('AfterFilter', function(event) {
		// add a result onto the beginning
		event.results.unshift({value:'Search the web for "' + event.text '"');
	});

			 */			
			evt = this.publish('AfterFilter', {
				text: evt.text,
				results: results
			});
			return evt.results;
		},
		/**
		 * Clear all the chosen tags
		 * @method clear
		 * @return {Suggester}
		 * @chainable
		 */
		clear: function() {
			$.each(this.tags, function() {
				this.getHidden().remove();
				this.getElement().remove(); 
			}); 
			this.tags = [];
			this.save();
			return this;
		},
		/**
		 * Get a collection of all the chosen tag objects
		 * @method getTags
		 * @return {Array}
		 */
		getTags: function() {
			return Array.prototype.slice.call(this.tags);
		},
		/**
		 * Iterate through each of the chosen tag objects
		 * @method eachTag
		 * @param {Function} iterator  The iterator function - function(i, tag) {}
		 * @return {Suggester}
		 * @chainable
		 */
		eachTag: function(iterator) {
			$.each(this.getTags(), iterator);
			return this;
		},
		/**
		 * Return a URL query string representing the hidden values of the input
		 * @method serialize
		 * @return {String}
		 */
		serialize: function() {
			var query = [];
			for (var i = 0, len = this.tags.length; i < len; i++) {
				query.push( encodeURIComponent(this.tags[i].getHidden().name) + '=' + encodeURIComponent(this.tags[i].getHidden().value) );
			}
			return query.join('&');
		},
		/**
		 * Pluck all the tag values from the chosen tags
		 * @method getValues
		 * @return {Array}
		 */
		getValues: function() {
			var values = [];
			for (var i = 0, len = this.tags.length; i < len; i++) {
				values.push( this.tags[i].getValue() );
			}
			return values;
		},
		/**
		 * Get the current value as a comma-delimited string
		 * @method getValue
		 * @return {String}
		 */
		getValue: function() {
			return this.getValues().join(',');
		},
		/**
		 * Set the widget's CSS theme - Adds a class "sugg-theme-%name%" to the widget
		 * @method setTheme
		 * @param {String} themeName  The name of the theme to use
		 * @return {Suggester}
		 * @chainable
		 */
		setTheme: function(themeName) {
			if (this._theme) {
				this.$widget.removeClass('sugg-theme-' + this._theme);
			}
			this._theme = themeName;
			this.$widget.addClass('sugg-theme-' + this._theme);
			return this;
		},
		/**
		 * Publish the given event name and send the given data
		 * @method publish
		 * @param {String} type  The name of the event to publish
		 * @param {Object} data  Additional data to attach to the event object
		 * @return {jQuery.Event}  The event object which behaves much like a DOM event object
		 */
		publish: function(type, data) {
			var evt = $.Event(type);
			evt.target = this;
			if (data) {
				$.extend(evt, data);
			}
			this.trigger(evt);
			return evt;
		},
		/**
		 * Get this instance. Useful for jQuery-style usage:  var instance = $('input').suggester(options).suggester('getInstance')
		 * @method getInstance
		 * @return {Suggester}
		 */
		getInstance: function() {
			return this;
		},    
		/**
		 * Set options and interpret options
		 * @method _processOptions
		 * @params {Object} options  Settings passed to constructor
		 */
		_processOptions: function(options) {
			this.options = $.extend({}, $.Suggester.defaultOptions, options);
			// interpret some overloaded options      
			if (this.options.matchAt == 'start' || this.options.matchAt == 'beginning') {
				this.options.matchAt = 0;
			}
		},    
		/**
		 * Render the widget and get handles to key elements
		 * @method _render
		 */
		_render: function() {
			// The full widget
			this.$widget = $(this.options.template);
			// BeforeRender callbacks now have the ability to modify this.$widget or any of its child elements
			/**
			 * Modify this.$widget or any of its child elements before it is manipulated or appended. Can be used to modify this.options.template with DOM methods
			 * @event BeforeRender
			 * @param {jQuery} widget  A reference to this.$widget
			 * @example
			 
	instance.bind('BeforeRender', function(event) {
		event.widget.find('.sugg-remove').text('').appendChild(myRemoveImage);
	});
			 
			 */
			this.publish('BeforeRender', {
				widget: this.$widget
			});
			// the container that tags and the input box are in
			this.$box = this.$widget.find('.sugg-box');
			// the template for tags
			this.$tagTemplate = this.$box.find('.sugg-tag').remove();
			// the text input used to type tags
			this.$input = this.$box.find('.sugg-input');
			if (this.options.placeholder) {
				this.$widget.addClass('sugg-placeholder-on');
				this.$input.val(this.options.placeholder);
			}
			// the wrapper for that text input
			this.$inputWrapper = this.$box.find('.sugg-input-wrapper');
			// the list element that contains all suggestions
			this.$suggListWrapper = this.$widget.find('.sugg-list-wrapper');
			this.$suggList = this.$widget.find('.sugg-list');
			if (this.options.suggListPosition == 'absolute') {
				this.$suggList.appendTo(document.body);
				document.body.style.position = 'relative';
				this.$suggList.css('position','absolute');
			}     
			// nodes to use for no suggestions and prompt
			this.$empty = this.$suggList.find('.sugg-empty').html(this.options.emptyText).remove();
			this.$prompt = this.$suggList.find('.sugg-prompt').html(this.options.prompt || '').remove();
			// the template html to use for suggestions
			this.listItemTemplate = this.options.listItemTemplate || this.$suggList.html();     
			// we got that html, now empty it out
			this.$suggList.html('');
			// make the list fly up or down
			this.setFlyDirection(this.options.fly);
			// actually insert the widget
			this.$widget.insertBefore(this.$originalInput.hide());
			// populate tags based on starting value of original input
			this._handleStartValue();
			if (this.options.minChars === 0) {
				// when minChars is 0, it acts like a regular drop down box
				this.options.inputSize = '';
				// set input width to remaining room
				// TODO: handle border-box and padding-box box sizing
				// TODO: consider position absolute and width 100% height 100%
				this.$input.width(
					this.$box.width() 
					- parseFloat(this.$inputWrapper.css('paddingLeft'))
					- parseFloat(this.$inputWrapper.css('paddingRight'))
					- parseFloat(this.$inputWrapper.css('marginLeft'))
					- parseFloat(this.$inputWrapper.css('marginRight'))
					- parseFloat(this.$inputWrapper.css('borderLeftWidth'))
					- parseFloat(this.$inputWrapper.css('borderRightWidth'))
					- parseFloat(this.$input.css('paddingLeft'))
					- parseFloat(this.$input.css('paddingRight'))
					- parseFloat(this.$input.css('marginLeft'))
					- parseFloat(this.$input.css('marginRight'))
					- parseFloat(this.$input.css('borderLeftWidth'))
					- parseFloat(this.$input.css('borderRightWidth'))
					);
			}
			this._updateInputSize();
			if (this.options.theme) {
				this.setTheme(this.options.theme);
			}
			/**
			 * Do something after the widget is completely rendered
			 * @event AfterRender
			 * @param {jQuery} widget  A reference to this.$widget
			 * @example
			 
	instance.bind('AfterRender', function(event) {
		heyItsAllRendered();
	});
			 
			 */
			this.publish('AfterRender', {
				widget: this.$widget
			});
		},
		/**
		 * Look at the initial element's start value and populate tags as appropriate
		 * @method _handleStartValue
		 */
		_handleStartValue: function() {
			// get a list of tags to insert now based on the current value of the original input
			// replaces escaped commas with \u0001 such that tag labels can have commas
			// if JavaScript RegExp supported lookbehinds we wouldn't need this \u0001 deal
			var startVal = this.$originalInput.val();
			if (startVal) {
				this.$widget.removeClass('sugg-placeholder-on');
				var existingTags = startVal.replace(/\\,/g, '\u0001,').split(/,/g);
				this.$originalInput.val('');
				var sugg = this;
				$.each(existingTags, function() {
					// add each tag by its label; this.$originalInput will get repopulated automatically
					sugg.add($.trim(this.replace(/\u0001/g, '')));
				});
			}     
		},
		/**
		 * Attach event handlers
		 * @method _setupListeners
		 */
		_setupListeners: function() {
			// proxy some methods to always be bound to our instance
			this.unfocusTag = $.proxy(this, 'unfocusTag');
			this.removeFocusedTag = $.proxy(this, 'removeFocusedTag');
			this.suggestIfNeeded = $.proxy(this, 'suggestIfNeeded');
			this._closeOnOutsideClick = $.proxy(this, '_closeOnOutsideClick');
			// clear default text if focused on input
			this.$input.focus($.proxy(this, '_onInputFocus'));
			this.$input.blur($.proxy(this, '_onInputBlur'));
			// remove tags when `X` is clicked
			this.$box.delegate('.sugg-remove', 'click', $.proxy(this, '_onTagRemoveClick'));
			// focus tags when clicked (for pre-deletion)
			this.$box.delegate('.sugg-tag', 'click', $.proxy(this, '_onTagClick'));
			// highlight suggestion on mouseover
			this.$suggList.mouseover($.proxy(this, '_onListMouseover'));
			// add a tag when suggestion is clicked
			this.$suggList.click($.proxy(this, '_onListClick'));
			// focus to text input field when a click comes outside of any tags
			this.$box.click($.proxy(this, '_onBoxClick'));
			// handle various actions associated with keypresses
			$.Suggester.quickBind(this.$input.get(0), 'keydown', $.proxy(this, '_onKeydown'));
			// handle paste into tag field
			this.$input.bind('cut delete', $.proxy(this, '_onCutDelete'));
			this.$input.bind('paste', $.proxy(this, '_onPaste'));
			// auto add tags on submit
			this.$form.submit($.proxy(this, '_onSubmit'));
		},
		/**
		 * Event handler for when this.$input is focused
		 * @method _onInputFocus
		 * @param {jQuery.Event} evt  The focus event
		 */
		_onInputFocus: function(evt) {
			this.$widget.addClass('sugg-active');
			this.$widget.removeClass('sugg-placeholder-on');
			var currVal = this.$input.val();
			this.unfocusTag();
			if (this.options.minChars === 0 && this.data.length > 0) {
				this.handleSuggestions(this.options.maxSuggestions > 0 ? this.data.slice(0, this.options.maxSuggestions) : this.data);
			}     
			else if (currVal === this.options.placeholder) {
				this.$input.val('');
				this._updateInputSize();
			}
			else if (currVal === '' & !!this.options.prompt) {
				this.showPrompt();
			}
		},
		/**
		 * Event handler for when this.$input is blurred
		 * @method _onInputBlur
		 * @param {jQuery.Event} evt  blur event
		 */
		_onInputBlur: function(evt) {
			var inputVal = $.trim(this.$input.val());
			if (this.options.placeholder && inputVal === this.options.placeholder) {
				this.$widget.addClass('sugg-placeholder-on');
			}
			else if (inputVal !== '' && this.options.addOnBlur) {
				var sugg = this;
				// the timeout will be cleared if the user has chosen a suggestion
				this._onInputBlurTimeout = setTimeout(function() {		
					sugg.add(inputVal);
					sugg.$input.val('');
				}, 500);
			}
			this.$widget.removeClass('sugg-active');      
		},
		/**
		 * Event handler for when .sugg-remove is clicked
		 * @method _onTagRemoveClick
		 * @param {jQuery.Event} evt  The click event
		 */   
		_onTagRemoveClick: function(evt) {
			this.unfocusTag();
			evt.preventDefault();
			evt.stopImmediatePropagation();
			var $tag = $(evt.target).parents('.sugg-tag');
			this.remove($tag);
		},
		/**
		 * Event handler for when .sugg-tag is clicked
		 * @method _onTagClick
		 * @param {jQuery.Event} evt  The click event
		 */     
		_onTagClick: function(evt) {
			var $target = $(evt.target);
			if (!$target.hasClass('sugg-tag')) {
				$target = $target.parents('.sugg-tag');
			}
			// we have to stop propagation to $box click and to $document
			evt.stopImmediatePropagation();
			this.focusTag($target); 
		},
		/**
		 * Event handler for when autosuggest list is moused over
		 * @method _onListMouseover
		 * @param {jQuery.Event} evt  The mouseover event
		 */     
		_onListMouseover: function(evt) { 
			var $target = $(evt.target);
			if ($target.hasClass('sugg-list')) {
				return;
			}
			if (!$target.hasClass('sugg-item')) {
				$target = $target.parents('.sugg-item');
			}
			if (!$target.hasClass('sugg-item')) {
				return;
			}
			this.deselectAllItems();
			this.selectItem($target);
			this.$currentItem = $target;
		},
		/**
		 * Event handler for when autosuggest list is clicked
		 * @method _onListClick
		 * @param {jQuery.Event} evt  The click event
		 */     
		_onListClick: function(evt) {
			clearTimeout(this._onInputBlurTimeout);
			// effectively delegate click to .sugg-item
			var $target = $(evt.target);
			if ($target.hasClass('sugg-list')) {
				return;
			}
			if (!$target.hasClass('sugg-item')) {
				$target = $target.parents('.sugg-item');
			}
			if (!$target.hasClass('sugg-item')) {
				return;
			}
			var record = $target.data('tag-record');
			this.add(record[this.options.valueProperty], record[this.options.labelProperty], $target);
			this.closeSuggestBox();
			if (this.options.multiselect) {
				this.$input.val('');
				this._updateInputSize();
				this.focus();
			}
		},
		/**
		 * Event handler for when this.$box is clicked
		 * @method _onBoxClick
		 * @param {jQuery.Event} evt  The click event
		 */     
		_onBoxClick: function(evt) {
			if (evt.target == this.$box[0]) {
				this.unfocusTag();
				this.focus();
			}
		},
		/**
		 * Handle keypresses while in tag input field
		 * @method _onKeydown
		 * @param {Event} evt  The keydown event (a raw browser event, not jQuery.Event)
		 */
		_onKeydown: function(evt) {
			/**
			 * Access the keydown event before Suggester processes it
			 * @event BeforeHandleKey
			 * @param {Event} keydown  The keydown event (a raw browser event, not jQuery.Event)
			 * @ifprevented  Key is not handled by Suggester. You may want to call event.keydown.preventDefault();
			 */
			var pubevent = this.publish('BeforeHandleKey', {
				keydown: evt,
				cancelable: true
			});
			if (pubevent.isDefaultPrevented()) {
				return;
			}
			var hasMetaKey = (evt.metaKey || evt.shiftKey || evt.altKey);
			if (hasMetaKey) {
				this._key_other(evt);
			}
			else {
				if (evt.which == 38) { // Up
					this._key_UP(evt);
				}
				else if (evt.which == 40) { // Down
					this._key_DOWN(evt);
				}
				else if (evt.which == 8) { // Backspace
					this._key_BACKSPACE(evt);
				}
				else if (
					(this.options.addOnTab && evt.which == 9) || 
					(this.options.addOnComma && evt.which == 188) ||
					(this.options.addOnSemicolon && evt.which == 59)
					) {
					this._key_TAB_COMMA(evt);
				}
				else if (evt.which == 27) { // Esc
					this._key_ESC(evt);
				}
				else if (evt.which == 13) { // Enter
					this._key_ENTER(evt);
				}
				else { // other keys
					this._key_other(evt);
				}
			}
			this._updateInputSize();
			/**
			 * Access the keydown event after Suggester processes it
			 * @event AfterHandleKey
			 * @param {Event} keydown  The keydown event (a raw browser event, not jQuery.Event)
			 */			
			this.publish('AfterHandleKey', {
				keydown: evt
			});
		},
		/**
		 * Handle cut and delete on this.$input
		 * @method _onCutDelete
		 * @param {jQuery.Event} evt  The cut, paste, or delete event
		 */
		_onCutDelete: function(evt) {
			// when cut or delete fires, input hasn't yet been updated so run on timeout
			setTimeout($.proxy(this._updateInputSize, this), 0);    
		},
		/**
		 * Handle paste on this.$input. Look for places to split pasted value
		 * For example pasting "a, b, c" will immediately add 3 tags (when this.options.addOnComma is true)
		 * It attempts to split on tab, then if there are no tabs then semicolons, then if there are no semicolons, commas
		 * @method _onPaste
		 * @param {jQuery.Event} evt  the paste event
		 */		
		_onPaste: function(evt) {
			var value, parts = [], tags = [], part, i, len;
			// get pasted value (see http://stackoverflow.com/questions/6035071/intercept-paste-event-in-javascript)
			try {
				// modern browsers
				value = evt.originalEvent.clipboardData.getData('text/plain');
			}
			catch (e) {
				// Lesser IE
				value = window.clipboardData.getData('Text');
			}
			evt.preventDefault();
			if (this.options.addOnTab) {
				parts = value.split('\t');
			}
			if (parts.length < 2 && this.options.addOnSemicolon) {
				parts = value.split(';');
			}
			if (parts.length < 2 && this.options.addOnComma) {
				parts = value.split(',');
			}
			if (parts.length > 0) {
				for (i = 0, len = parts.length; i < len; i++) {				
					part = $.trim(parts[i]);
					if (part !== '') {
						tags.push(part);
					}
				}
			}
			/**
			 * Respond before values are pasted
			 * @event BeforePaste
			 * @param {jQuery.Event} event  The paste event
			 * @param {String} value  The raw value that was pasted
			 * @param {Array} tags  The array of tags to be added (if the value was successfully split on tab, semicolon, or comma). If changed, the added tags will change.
			 * @ifprevented  tags are not added and paste is cancelled
			 * @example      

	instance.bind('BeforePaste', function(event) {
		if (event.tags.length > 1 && !confirm('Did you mean to paste ' + event.tags.length + ' items?\n\nClick OK to continue. Click cancel to treat it as one item.')) {
			this.$input.val(event.value);
			event.preventDefault();
		}
	});

			 */ 
			var pubevt = this.publish('BeforePaste', {
				event: evt,
				value: value,
				tags: tags
			});
			if (pubevt.isDefaultPrevented()) {
				// don't add any tags
				return;
			}
			if (pubevt.tags.length < 2) {				
				// only text here (not a list of tags) so let the user continue typing;
				this.$input.val( this.$input.val()+value );
				this._updateInputSize();
				return;
			}
			// we are going to add each tag
			evt.preventDefault();
			for (i = 0, len = pubevt.tags.length; i < len; i++) {				
				this.add(tags[i]);
			}
			/**
			 * Respond after values are pasted
			 * @event AfterPaste
			 * @param {jQuery.Event} event  The paste event
			 * @param {String} value  The raw value that was pasted
			 * @param {Array} tags  The array of tags that were added (if the value was successfully split on tab, semicolon, or comma)
			 * @example      

	instance.bind('AfterPaste', function(event) {
		if (event.tags.length > 1) {
			alert('You pasted ' + event.tags.length + ' tags');
		}
	});

			 */
			this.publish('AfterPaste', {
				event: evt,
				value: value,
				tags: pubevt.tags
			});
		},
		/**
		 * Handle UP key on this.$input
		 * @method _key_UP
		 * @param {Event} evt  The keydown event
		 */
		_key_UP: function(evt) {
			evt.preventDefault();
			// unfocus any focused tags
			this.unfocusTag();
			// move selection up in suggestion box
			this.moveSelection('up');     
		},
		/**
		 * Handle DOWN key on this.$input
		 * @method _key_DOWN
		 * @param {Event} evt  The keydown event
		 */   
		_key_DOWN: function(evt) {
			evt.preventDefault();
			// unfocus any focused tags
			this.unfocusTag();
			if (this.isSuggestBoxOpen()) {
				// move selection down in suggestion box
				this.moveSelection('down');     
			}
		},
		/**
		 * Handle BACKSPACE key on this.$input
		 * @param {Event} evt  The keydown event
		 */   
		_key_BACKSPACE: function(evt) {
			var $lastTag;
			this.$currentItem = null;
			if (this._isCursorAtStart()) {
				if (this.options.multiselect && this.tags.length > 0) {
					evt.preventDefault();
					$lastTag = this.tags[this.tags.length-1].$tag;
					if (this.$focusedTag && $lastTag && this.$focusedTag[0] == $lastTag[0]) {
						this.remove($lastTag);
					}
					else if ($lastTag) {
						this.$focusedTag = $lastTag;
						$lastTag.addClass('sugg-focused');
					}
				}
				this.closeSuggestBox();
			}
			else {
				// update suggestions
				this._key_other(evt);
			}
		},
		/**
		 * Handle TAB and COMMA and SEMICOLON key on this.$input
		 * @param {Event} evt  The keydown event
		 */   
		_key_TAB_COMMA: function(evt) {
			if (evt.which == 9) { // tab
				if (this.$input.val() === '') {
					// go ahead and tab to next field
					return;
				}
			}
			// tab or comma or semicolon
			evt.preventDefault();
			if (this.$input.val() === '') {
				// no value so don't create a new tag
				return;
			}
			this.$currentItem = null;
			this.add(this.$input.val());
			if (this.options.multiselect) {
				this.$input.val('');
			}
			this.closeSuggestBox();
		},
		/**
		 * Handle ESC key on this.$input
		 * @param {Event} evt  The keydown event
		 */   
		_key_ESC: function(evt) {
			this.closeSuggestBox();     
		},
		/**
		 * Handle ENTER key on this.$input
		 * @param {Event} evt  The keydown event
		 */
		_key_ENTER: function(evt) {
			if (this.$currentItem) {
				// add the item that was selected via arrow or hover
				var record = this.$currentItem.data('tag-record');
				this.add(record[this.options.valueProperty], record[this.options.labelProperty], this.$currentItem);
				if (this.options.multiselect) {
					this.$input.val('');
				}
				this.closeSuggestBox();
				this.$currentItem = null;
			}
			if (!this.options.submitOnEnter) {
				// don't let form submit
				evt.preventDefault();
			}     
		},
		/**
		 * Handle other keys (e.g. printable characters) on this.$input
		 * @param {Event} evt  The keydown event
		 */   
		_key_other: function(evt) {
			// abort any outstanding xhr requests and clear timeout from key delay
			this.abortFetch();
			// clear key delay
			clearTimeout(this.timeoutHandle);
			// remove suggestion box selection
			this.$currentItem = null;
			// unfocus any tags selected for deletion
			this.unfocusTag();
			// start the timeout
			this.timeoutHandle = setTimeout(this.suggestIfNeeded, this.options.keyDelay || 0);      
		},
		/**
		 * Handler for form submission
		 * 
		 * @param {jQuery} jqEvent  The submit event
		 */
		_onSubmit: function(jqEvent) {
			/**
			 * Respond before form is submitted and before Suggester adds on submit
			 * @event BeforeSubmit
			 * @param {jQuery.Event}  The jQuery-wrapped browser event
			 * @param {HTMLFormElement} form   The input's form (same as this.$form)
			 * @ifprevented  Form will not be submitted
			 * @example      

	instance.bind('BeforeSubmit', function(event) {
		if (this.$input.val() !== '' && !confirm('Are you sure you want to submit this form unfinished?')) {
			event.preventDefault();
		}
	});

			 */   
			var evt = this.publish('BeforeSubmit', {
				event: jqEvent,
				form: this.$form,
				cancelable: true
			});
			// cancel form submission
			if (evt.isDefaultPrevented()) {
				jqEvent.preventDefault();
				return;
			}
			if (this.options.addOnSubmit) {
				if (this.$input.val() !== '') {
					this.$currentItem = null;
					this.add(this.$input.val());
					if (this.options.multiselect) {
						this.$input.val('');
					}
					this.closeSuggestBox();
				}
			}
		},
		/**
		 * The handler function that is passed to $.ajax({beforeSend:...}) to alter XHR if needed
		 * @method _beforeFetch
		 * @param {jqXHR} jqXHR  The jQuery XHR object (see http://api.jquery.com/jQuery.ajax/#jqXHR)
		 */
		_beforeFetch: function(jqXHR) {
			/**
			 * A chance to access the jqXHR before the ajax request has been sent
			 * @event BeforeFetch
			 * @param {jqXHR} jqXHR  the jQuery XHR object (see http://api.jquery.com/jQuery.ajax/#jqXHR)
			 * @param {String} term   the term that is being searched for
			 * @ifprevented  XHR is aborted
			 * @example

	instance.bind('BeforeFetch', function(event) {
		event.jqXHR.setRequestHeader('something','something');
		event.jqXHR.fail(function() {
			alert('ajax call failed');
		}).always(function() {
			alert('ajax call finished regardless of success or failure');
		});
	});
			
			 */
			this._jqXHR = jqXHR;
			var evt = this.publish('BeforeFetch', {
				jqXHR: this._jqXHR,
				term: this._searchTerm,
				cancelable: true
			});
			if (evt.isDefaultPrevented()) {
				this.abortFetch();
			}
		},
		/**
		 * Handler passed to $.ajax().done(function(){...}) that handles suggestion data that is returned
		 * @method _afterFetch
		 * @param {Array} records  The Array of record objects returned from the XHR
		 */
		_afterFetch: function(records) {
			/**
			 * @event AfterFetch
			 * @param {jqXHR} jqXHR    The jQuery XHR object (see http://api.jquery.com/jQuery.ajax/#jqXHR)
			 * @param {Object[]} records  The Array of record objects returned from the XHR
			 * @param {String} term     The term that was search for
			 * @ifprevented  Nothing is done with results (i.e. suggestion box is not built and displayed)
			 * @example

	instance.bind('AfterFetch', function(event) {
		event.data.push({value:'', label:'Adding a test suggestion at the end'});
	});
			
			 */   
			var evt = this.publish('AfterFetch', {
				jqXHR: this._jqXHR,
				records: records,
				term: this._searchTerm,
				cancelable: true
			});
			this._jqXHR = null;
			if (evt.isDefaultPrevented()) {
				return;
			}
			this.handleSuggestions(evt.records);
		},
		/**
		 * Callback used to close the suggestion box when the user clicks off of it
		 * @param {jQuery.Event} evt  The click event
		 */
		_closeOnOutsideClick: function(evt) {
			var $target = $(evt.target);
			if ($target.parents('.sugg-widget')[0] == this.$widget[0]) {
				return;
			}
			this.closeSuggestBox();
		}, 
		/**
		 * Format a suggestion before display
		 * @method _formatSuggestion
		 * @param {Object} record  The record that was suggested
		 * @param {String} substr  The string that generated the list of suggestions
		 * @return {String}  HTML to use as the item (e.g. '<li class="sugg-item">Suggestion</li>')
		 */
		_formatSuggestion: function(record, substr) {
			var evt, options, label, replacer, replacee, html;
			/**
			 * Call to dynamically inject your own formatting on each suggestion
			 * @event BeforeFormat
			 * @param {Object} record  The record object that is being suggested
			 * @param {String} substr  The part of the string that matches the suggestion search fields
			 * @param {String} html    If you set event.html, it will be used instead of constructing the HTML
			 * @example

	instance.bind('BeforeFormat', function(event) {
		event.html = '<li>' + event.record.label.toUpperCase() + '</li>';
	});              

			 */
			evt = this.publish('BeforeFormat', {
				record: record, 
				substr: substr, 
				html:''
			});
			if (evt.html === '') {
				options = this.options;
				label = record[options.valueProperty];
				// handle case insensitive replacements
				replacer = options.caseSensitive ? evt.substr : new RegExp('(' + evt.substr + ')', 'i');
				replacee = options.caseSensitive ? evt.substr : '$1';
				// allow replacements of all {record.field} matches in this.listItemTemplate
				evt.html = this.listItemTemplate.replace(/\{record\.(.+?)\}/g, function($0, $1) {
					var replacement = evt.record[$1];
					if (typeof replacement == 'string' || !!replacement) {
						if ($1 == options.valueProperty && options.hightlightSubstring) {           
							replacement = replacement.replace(replacer, '<strong class="sugg-match">' + replacee + '</strong>');
						}
						return replacement;
					}
					return '';
				});
			}
			/**
			 * Alter the HTML that has been constructed before it is put into the DOM
			 * @event AfterFormat
			 * @param {Object} record  The record object that is being suggested
			 * @param {String} substr  The part of the string that matches the suggestion search fields
			 * @param {String} html    Change the HTML before it is put into the dom
			 * @example

	instance.bind('AfterFormat', function(event) {
		event.html; // <li><strong class="sugg-match">Canis</strong> Major</li>
		event.html = event.html.replace(/<\/?strong\b/, 'em');
	});

			 */			
			evt = this.publish('AfterFormat', {
				record: evt.record,
				substr: evt.substr,
				html: evt.html
			});
			return evt.html;
		},
		/**
		 * Update the size when this.options.inputSize is "auto"
		 */
		_updateInputSize: function() {
			if (this.options.inputSize == 'auto') {         
				this.$input.prop('size', this.$input.val().length + 2); 
			}
		},
		/**
		 * Set the value of the original input to a comma-delimited set of labels
		 * @method save
		 * @return {String}  The new value
		 */
		save: function() {
			var oldValue = this.$originalInput.val();
			var newValue;
			var vals = [];
			for (var i = 0, len = this.tags.length; i < len; i++) {
				vals.push(this.tags[i].getValue().replace(/,/g, '\\,'));
			}
			newValue = vals.join(',');
			/**
			 * Inject functionality before saving
			 * @event BeforeSave
			 * @param {String} newValue  The value that will be written to the original input (writeable)
			 * @ifcancelled  The original input will not be populated with the new value
			 * @example

	instance.bind('BeforeSave', function(event) {
		event.newValue += '!';
	});

			 */
			var evt = this.publish('BeforeSave', {
				cancelable: true,
				oldValue: oldValue,
				newValue: newValue
			});
			if (evt.isDefaultPrevented()) {
				return oldValue;
			}
			this.$originalInput.val(evt.newValue);
			/** 
			 * Do something after saving value to original input
			 * @event AfterSave
			 * @param {String} oldValue  The value before saving
			 * @param {String} newValue  The value that was written to the original input
			 * @example

	instance.bind('AfterSave', function(event) {
		saveToServer(event.newValue);
	});
      
			 */			
			this.publish('AfterSave', {
				oldValue: oldValue,
				newValue: evt.newValue
			});
			if (oldValue != evt.newValue) {
				/** 
				 * Fired when the value changes as by adding or removing a tag
				 * @event Change
				 * @param {String} oldValue  The value before saving
				 * @param {String} newValue  The new value
				 * @example

	instance.bind('AfterChange', function(event) {
		noteSomeChange();
	});

				 */						
				this.publish('Change', {
					oldValue: oldValue,
					newValue: evt.newValue
				});
			}
			return evt.newValue;
		},
		/**
		 * Given tag text, remove a tag from the internal collection and from the DOM
		 * @method _spliceTag
		 * @param {String} value      The text of the tag
		 * @return {Object}  The record associated with that tag
		 */
		_spliceTag: function(value) {
			var idx = this.getTagIndex(value);      
			if (idx > -1) {
				return this._spliceTagByIdx(idx);
			}
			return undefined;
		},
		/**
		 * Given an array index, remove a tag from the internal collection and from the DOM
		 * @method _spliceTagByIdx
		 * @param {Number} idx  The index position in the internal collection
		 * @return {Suggester.Tag}  The Suggester.Tag object that was removed
		 */   
		_spliceTagByIdx: function(idx) {
			var tag = this.tags[idx];
			var newTags = [];
			var newIndex = 0;
			for (var i = 0, len = this.tags.length; i < len; i++) {
				if (i === idx) {
					this.tags[i].getHidden().remove();
					this.tags[i].getElement().remove();
				}
				else {
					this.tags[i].index = newIndex++;
					newTags.push(this.tags[i]);
				}
			}
			this.tags = newTags;
			return tag;
		},
		/**
		 * Find a tag given value
		 * @method getTagIndex
		 * @param {String} value      The text of the tag
		 * @return {Number}  The index position of the tag in the internal collection or -1 if not found
		 */
		getTagIndex: function(value) {
			var idx = -1, i, len;
			for (i = 0, len = this.tags.length; i < len; i++) {
				if (this.tags[i].getValue() == value) {
					idx = i;
					break;
				}
			}
			return idx;     
		},
		/**
		 * Setup publish/subscribe system that uses jQuery's event system. Allows subscribing this way: instance.bind('AfterFilter', myhandler)
		 * @method _setupPubsub
		 */
		_setupPubsub: function() {
			this.pubsub = $(this);
			this.on = $.proxy(this.pubsub, 'on');
			this.off = $.proxy(this.pubsub, 'off');
			this.one = $.proxy(this.pubsub, 'one');
			this.bind = $.proxy(this.pubsub, 'bind');
			this.unbind = $.proxy(this.pubsub, 'unbind');
			this.trigger = $.proxy(this.pubsub, 'trigger');
			this.triggerHandler = $.proxy(this.pubsub, 'triggerHandler');
			// bind listeners passed in the options (e.g. onInitialize)
			for (var name in this.options) {
				if (name.match(/^on[A-Z0-9]/) && typeof this.options[name] == 'function') {
					this.bind(name.slice(2), this.options[name]);
				}
			}
		},
		/**
		 * Given an input element, get the cursor position. Used to determine if backspace key should delete the previous tag
		 * @method _isCursorAtStart
		 * @return {Boolean}  true if the cursor is at the start and no text is selected
		 */
		_isCursorAtStart: function() {
			var selStart = _getSelectionStart(this.$input[0]);
			var selEnd = _getSelectionEnd(this.$input[0]);
			return selStart === 0 && selEnd === 0;
		}
	};
  
	// cursor helper methods
	// from http://javascript.nwbox.com/cursor_position/cursor.js
	function _getSelectionStart(o) {
		if (o.createTextRange) {
			var r = document.selection.createRange().duplicate();
			r.moveEnd('character', o.value.length);
			if (r.text === '') {
				return o.value.length;
			}
			return o.value.lastIndexOf(r.text);
		}
		return o.selectionStart;
	}
	function _getSelectionEnd(o) {
		if (o.createTextRange) {
			var r = document.selection.createRange().duplicate();
			r.moveStart('character', -o.value.length);
			return r.text.length;
		}
		return o.selectionEnd;
	}
  
	//
	// static properties and methods
	//
	$.Suggester.version = '1.2.1';
	/**
	 * Pass to contructor to subclass (e.g. `MySuggester.prototype = new $.Suggester($.Suggester.doSubclass)`)
	 * @var {Object}
	 */
	$.Suggester.doSubclass = {};
	/**
	 * A collection of all the instances
	 * @property {Array} instances
	 * @static
	 */
	$.Suggester.instances = [];
	/**
	 * Add data to all instances
	 * @method addData
	 * @static
	 * @param {Object[]} data  Add more data to all the registered instances
	 * @return {Suggester}
	 */
	$.Suggester.addData = function(data) {
		$.each($.Suggester.instances, function() {
			this.addData(data);
		});
		return this;
	};
	/**
	 * Lightweight event handler to allow keydown to have less overhead (i.e. bypass jQuery's event system)
	 */
	$.Suggester.quickBind = document.addEventListener ? 
		function(element, type, handler) {
			element.addEventListener(type, handler, false);
		} :
		function(element, type, handler) {
			element.attachEvent('on'+type, function(evt) {
				evt = evt || window.event;
				evt.preventDefault = function() {
					evt.returnValue = false;
				};
				handler.call(element, evt);
			});
		}
	;
	/**
	 * Create a subclass of Suggester
	 * @method subclass
	 * @static
	 * @param {String} jQueryMethodName  The method name to add to jQuery.fn
	 * @param {Object} [properties]  Additional properties and methods to add to subclass
	 * @return {Function}  The new class object
	 * @example

	var MySuggester = $.Suggester.subclass('mysuggester', {
		initialize: function($textInput, options) {
			options = options || {};
			this.options.myOption = options.myOptions || 'default';
			this.callParent('initialize', $textInput, options);
		}
	});
	// now call $(selector).mysuggester(options);
		
	 */
	$.Suggester.subclass = function(jQueryMethodName, properties) {
		var Ctor = function() {
			this.initialize.apply(this, Array.prototype.slice.call(arguments));
		};
		Ctor.prototype = new $.Suggester($.Suggester.doSubclass);
		Ctor.prototype.callParent = function(method/*, arg1, arg2, arg3*/) {
			$.Suggester.prototype[method].apply(this, method, Array.prototype.slice.call(arguments, 1));
		};
		Ctor.prototype.applyParent = function(method, args) {
			$.Suggester.prototype[method].apply(this, method, args);
		};
		$.extend(Ctor.prototype, properties || {});
		makePlugin(jQueryMethodName, Ctor);
		return Ctor;
	};
	function makePlugin(name, Ctor) {
		$.fn[name] = function(options) {    
			// handle where first arg is method name and additional args should be passed to that method
			if (typeof options == 'string' && this.data('SuggesterInstance') instanceof $.Suggester && typeof this.data('SuggesterInstance')[options] == 'function') {
				var args = Array.prototype.slice.call(arguments, 1);
				return this.data('SuggesterInstance')[options].apply(this.data('SuggesterInstance'), args);
			}
			if (this.data('SuggesterInstance')) {
				return this;
			}
			// otherwise create new $.Suggester instance but return the jQuery instance
			return this.each(function() {     
				var $elem = $(this);
				var instance = new Ctor($elem, options);
				$elem.data('SuggesterInstance', instance);
			});
		};
	}
	makePlugin('suggester', $.Suggester);
	$.Suggester.Tag = function() {
		this.initialize.apply(this, Array.prototype.slice.call(arguments));
	};  
	$.Suggester.Tag.prototype = {
		/**
		 * @class Tag
		 * @constructor
		 * @namespace Suggester
		 * @param {Object} properties
		 *   @param {Suggester} properties.suggester  The Suggester to which this tag belongs
		 *   @param {String} properties.value  The value of the tag
		 *   @param {String} properties.label  The display text of the tag
		 *   @param {Number} properties.index  The index relative to other tags
		 *   @param {jQuery} properties.$hidden  The hidden input element
		 *   @param {jQuery} properties.$tag  The tag element
		 *   @param {Object|undefined} properties.record  The record corresponding to this tag, if any
		 */
		initialize: function(properties) {
			$.extend(this, properties);
		},
		/**
		 * The Suggester to which this tag belongs
		 * @property {Suggester} suggester
		 */
		/**
		 * The value of the tag
		 * @property {String} value
		 */
		/**
		 * The display text if the tag
		 * @property {String} label
		 */
		/**
		 * The index relative to other tags
		 * @property {Number} index
		 */
		/**
		 * The hidden input element
		 * @property {jQuery} $hidden
		 */
		/**
		 * The tag elements
		 * @property {jQuery} $tag
		 */
		/**
		 * The record corresponding to this tag, if any
		 * @property {Object|undefined}
		 */
		
		/**
		 * Get the Suggester widget to which this tag belongs
		 * @method getWidget
		 * @return {Suggester}
		 */
		getWidget: function() {
			return this.suggester;
		},
		/**
		 * Remove this tag from the tag collection
		 * @method remove
		 * @return {Suggester.Tag}
		 * @chainable
		 */
		remove: function() {
			this.suggester.remove(this.value);
			return this;
		},
		/**
		 * Get thee index of this tag relative to others
		 * @method getIndex
		 * @return {Number}
		 */
		getIndex: function() {
			return this.index;
		},
		/**
		 * Get the hidden value of this tag
		 * @method getValue
		 * @return {String}
		 */
		getValue: function() {
			return this.value;
		},
		/**
		 * Set the hidden value of this tag
		 * @param {String} value  The new value
		 * @return {Suggester.Tag}
		 * @chainable
		 */
		setValue: function(value) {
			this.value = value;
			this.$hidden.val(value);
			this.suggester.save();
			return this;
		},
		/**
		 * Get the visible label of this tag
		 * @method getLabel
		 * @return {String}
		 */
		getLabel: function() {
			return this.label;
		},
		/**
		 * Set the visibile label of this tag
		 * @method setLabel
		 * @return {Suggester.Tag}
		 * @chainable
		 */
		setLabel: function(label) {
			this.label = label;
			this.$tag.text(label);
			return this;
		},
		/**
		 * Get the hidden value of the tag
		 * @method getHidden
		 * @return {String}
		 */
		getHidden: function() {
			return this.$hidden;
		},
		/**
		 * Get the tag element
		 * @method getElement
		 * @return {jQuery}
		 */
		getElement: function() {
			return this.$tag;
		},
		/**
		 * Get the record that generated this tag, if any
		 * @return {Object|undefined}
		 */
		getRecord: function() {
			return this.record;
		}
	};
}));  
