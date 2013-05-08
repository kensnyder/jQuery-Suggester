/*
 * Suggester - A Better Autocomplete Widget
 * Copyright 2012-2013 Ken Snyder
 * GitHub: https://github.com/kensnyder/jQuery-Suggester
 * Demos: http://sandbox.kendsnyder.com/suggester/demo/demo.html
 *
 * Version 1.0.2, April 2013
 *
 * Turn a text input into a Gmail / Facebook-style auto-complete widget. Features include:
 *   - Load data from a JavaScript array, object, json url, or jsonp url
 *   - Lots of options
 *   - Populates original input with chosen tags but also creates hidden inputs with ids and tag text
 *   - Has methods to add a tag programmatically (e.g. user chooses a popular tag)
 *   - CSS is easy to extend and customize
 *   - CSS uses em units so that you can easily size the widget however you like
 *   - You can subscribe to any of 20+ events that allow you to inject custom functionality into nearly every action
 *   - You can define your own HTML structure for the widget output
 *   - Object-oriented structure makes for easy extendibility
 *   - Less than 6kb minimized and gzipped
 *   - Unit tested - http://sandbox.kendsnyder.com/suggester/demo/unit-tests.html
 *   - Tested on IE8+, FF, Chrome, Safari
 *   - Campatibile with AMD
 *  
 * Inspired by the AutoSuggest plugin by Drew Wilson
 *
 * Suggester is licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 */
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
   * See below for comments on each option
   */
	$.Suggester.defaultOptions = {
		// data to use instead of an ajax call
		data: false,
		// name of object property that should be used as the tag's hidden value
		valueProperty: "value",      
		// name of object property that should be used as the tag's display text
		labelProperty: "value",      
		// array of object property names that should be searched
		searchProperties: ["value"],
		// where to match when finding suggestions. anywhere|start|end or an integer
		matchAt: 'anywhere',
		// if true, fine matches regardless of case
		caseSensitive: false,
		// url to call to get json or jsonp results. Use %s to indicate where search text should be inserted
		// e.g. http://example.com/myjson?query=%s
		// e.g. http://example.com/myjsonp?query=%s&callback=%s
		dataUrl: false,
		// can be json or jsonp
		// if json, url needs to have "callback" in the format http://example.com/myjsonp?query=%s&mycallback=%s
		// to handle xml, you'll need to register a BeforeFetch and afterFetch or overwrite the fetchResults function
		dataType: 'json',
		// which way should the suggestion box fly
		// if "up", the suggestion box will exist before the input box
		// a css class of sugg-fly-up or sugg-fly-down is applied to the widget element
		fly: 'down',
		// if "absolute", the suggestion box will be appended to <body> and positioned and sized each time it is opened
		suggListPosition: 'relative',
		// if true, allow multiple selections
		multiselect: true,
		// if true, the first tag will be removed when a duplicate is typed in
		preventDuplicates: true,
		// if true, don't suggest items that have already been chosen as tags
		omitAlreadyChosenItems: true,
		// the minimum number of characters a user must type before the suggestion box will appear
		// if 0, show choices when input is simply focused (like a <select>)
		minChars: 3,
		// the number of milliseconds between keystrokes before the suggestion lookup begins
		keyDelay: 400,
		// If true, typing a comma will add the current text as a tag
		addOnComma: true,
		// If true, typing a tab will add the current text as a tag
		addOnTab: true,
		// If true, typing a semicolon will add the current text as a tag
		addOnSemicolon: false,
		// If true, add tag on submit if user has entered text but not typed comma or tab
		addOnSubmit: true,
		// If true, add tag when widget is blurred
		addOnBlur: true,
		// if false, prevent the form from submitting when the user presses enter on the empty input
		submitOnEnter: false,
		// Manually set the input size property to a certain width. If auto, set size to text width
		inputSize: 'auto',
		// placeholder text to display when no tags are present
		// e.g. "Enter tags..."
		placeholder: '',
		// message to show when there are no suggestions
		emptyText: '(Type a comma to create a new item)',
		// message to display when below min char length
		prompt: false,
		// only display this many suggestions
		maxSuggestions: 10,
		// if true, also add a hidden input for each tag (fieldname_tag[]) for easier server-side processing
		addHiddenInputs: true,
		// The name to use for hidden elements (defaults to the original input's name plus "_tags[]")
		hiddenName: null,
		// if true, wrap first matching substring in each suggestion with <strong class="sugg-match"></strong>
		hightlightSubstring: true,
		// the html used to generate the widget
		// you can add more markup, change tag names, or add css classes, but all the sugg-* classes need to remain
		template:
		'<div class="sugg-widget">' + // this.$widget
			'<ul class="sugg-box">' + // this.$box
				'<li class="sugg-box-item sugg-tag">' + // this.$tagTemplate
					'<span class="sugg-label">TAG TEXT GOES HERE</span><span class="sugg-remove" title="Click to remove">&times;</span>' +
				'</li>' + 
				'<li class="sugg-box-item sugg-input-wrapper">' + // this.$inputWrapper
					'<input type="text" class="sugg-input" value="" />' + // this.$input
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
		listItemTemplate: null, // overrides .sugg-item html above
    
		theme: 'coolblue'
	/* 
	 * AVAILABLE EVENT OPTIONS
	 * 
	 * onBeforeRender     -> see jQuery.Suggester#_render()
	 * onInitialize       -> see jQuery.Suggester#initialize()
	 * onBeforeHandleKey  -> see jQuery.Suggester#_onKeydown()
	 * onAfterHandleKey   -> see jQuery.Suggester#_onKeydown()
	 * onBeforeAjax       -> see jQuery.Suggester#fetchResults()
	 * onBeforeFetch      -> see jQuery.Suggester#_beforeFetch()
	 * onAfterFetch       -> see jQuery.Suggester#_afterFetch()
	 * onBeforeMove       -> see jQuery.Suggester#moveSelection()
	 * onAfterMove        -> see jQuery.Suggester#moveSelection()
	 * onBeforeSuggest    -> see jQuery.Suggester#handleSuggestions()
	 * onAfterSuggest     -> see jQuery.Suggester#handleSuggestions()
	 * onBeforeOpen       -> see jQuery.Suggester#openSuggstBox()
	 * onAfterOpen        -> see jQuery.Suggester#openSuggestBox()
	 * onBeforeClose      -> see jQuery.Suggester#closeSuggestBox()
	 * onAfterClose       -> see jQuery.Suggester#closeSuggestBox()
	 * onBeforeFormat     -> see jQuery.Suggester#_formatSuggestion()
	 * onAfterFormat      -> see jQuery.Suggester#_formatSuggestion()
	 * onBeforeFilter     -> see jQuery.Suggester#getResults()
	 * onAfterFilter      -> see jQuery.Suggester#getResults()
	 * onBeforeAdd        -> see jQuery.Suggester#add()
	 * onAfterAdd         -> see jQuery.Suggester#add()
	 * onBeforeRemove     -> see jQuery.Suggester#remove()
	 * onAfterRemove      -> see jQuery.Suggester#remove()
	 * onBeforeSave       -> see jQuery.Suggester#save()
	 * onAfterSave        -> see jQuery.Suggester#save()
	 * onBeforeSubmit     -> see jQuery.Suggester#_onSubmit()
	 */
	};
	// Making Suggester a proper class allows two patterns:
	// $('selector').suggester(options);
	// $('selector').suggester('method', arg1, arg2);
	// var instance = $('selector').suggester('getInstance');
	// -- OR -- 
	// var instance = new $.Suggester('selector', options)
	$.Suggester.prototype = {
		/**
		 * @class jQuery.Suggester widget
		 * @param {String|HTMLElement|jQuery} $textInput  The text input as a jQuery object, DOM element, or selector string
		 * @param {Object} options  An object with data and options (See $.Suggester.defaultOptions for explaination of options)
		 * @return {jQuery.Suggester}
		 * 
		 * @property {jQuery} $originalInput   The input used to make the widget
		 * @property {Object} options          The options passed to the constructor (see jQuery.Suggester.defaultOptions)
		 * @property {Object[]} data           Static data used instead of an ajax call
		 * @property {Object[]} tags           A collection of information about each tag that has been added (each item has properties record, $tag, and $hidden)
		 * @property {String} hiddenName       The name to use for hidden elements (defaults to the original input's name plus "_tags[]")
		 * @property {jQuery} $focusedTag      The tag that is selected for deletion
		 * @property {jQuery} $currentItem     
		 * @property {jQuery} pubsub           The publish and subscribe handle
		 * @property {jQuery} $widget          The element that wraps the widget
		 * @property {jQuery} $box             The container that holds the chosen tags
		 * @property {jQuery} $tagTemplate     The tag element that is cloned to make new tags
		 * @property {jQuery} $input           The input that users type in
		 * @property {jQuery} $inputWrapper    The container for the input
		 * @property {jQuery} $suggList        The suggestion list
		 * @property {jQuery} $suggListWrapper The element that is positioned relatively to hold the absolutely positioned suggestion list
		 * @property {String} listItemTemplate The html to use for suggestion list items
		 * @property {String} _searchTerm      The search term we are currently searching for
		 * @property {String} _text            The text in the input box that will be used to fetch results (i.e. what the user just typed)
		 * @property {jqXHR} _jqXHR            The jQuery XHR object used initilized for fetching data - http://api.jquery.com/jQuery.ajax/#jqXHR
		 * 
		 * @event Initialize - Called after widget is initialized and rendered
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
			// Initialize callback now has access to the completed widget through this.$widget, this.$box, etc.
			this.publish('Initialize');
			return this;
		},
		/**
		 * Completely remove Suggester widget and replace with original input box (with values populated)
		 * @param {Object} options
		 *    options.keepHiddenInputs {Boolean}  If true, append all hidden inputs after the original input
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
		 * @param {String} value  the tag to add
		 * @param {String} label  the text to display in the new tag
		 * @param {jQuery} $item  Set when the record is added by choosing from the suggestion box
		 * @return {jQuery} The jQuery object containing the newly created label or undefined of one was not created
		 * 
		 * @event BeforeAdd - Allows you to prevent it being added or alter the record before adding
		 *     event.value     The tag to be added
		 *     event.item      The suggestion that was chosen (if any)
		 *     event.isCustom  If true, the item is not a suggestion
		 *     example       instance.bind('BeforeAdd', function(event) {
		 *                        if (isSwearWord(evt.value)) {
		 *                            event.preventDefault();
		 *                            alert('Tags cannot be swear words');
		 *                        }
		 *                   });
		 * 
		 * @event AfterAdd
		 *     event.item    The suggestion that was chosen (if any)
		 *     event.tag     The jQuery element of the tag that was added
		 *     event.hidden  The hidden input that was generated
		 *     event.value   The value of the tag
		 *     event.label   The the label of the tag
		 *     example       instance.bind('AfterAdd', function(event) {
		 *                        // fade in tag
		 *                        event.tag.fadeIn(500);
		 *                   });
		 */
		add: function(value, label/*optional*/, $item/*optional*/) {
			var evt, idx, $hidden, $tag;
			if (typeof label != 'string') {
				label = value;
			}
			evt = this.publish('BeforeAdd', {
				value: value,
				label: label,
				item: $item,
				record: $item ? $item.data('tag-record') : undefined
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
			// trigger our after add event
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
		 * @event BeforeMove (if event.preventDefault() is called, movement is stopped)
		 *     event.direction  "up" or "down"
		 *     event.current    jQuery object with the currently selected item or null if there isn't one
		 *     event.next       jQuery object with the item that will be selected next
		 *     example          instance.bind('BeforeMove', function(event) {
		 *                          alert('You are moving to ' + event.next.text());
		 *                      });
		 * @event AfterMove
		 *     event.direction  "up" or "down"
		 *     event.last       jQuery object with the previously selected item
		 *     event.current    jQuery object with the newly selected item
		 *     example          instance.bind('AfterMove', function(event) {
		 *                          alert('You moved to ' + event.current.text());
		 *                      });
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
			// BeforeMove callback allows movement to be changed
			// TODO: properly use BeforeMove evt to allow changing stuff
			var evt = this.publish('BeforeMove', {
				direction: direction,
				current: this.$currentItem,
				next: $nextItem, 
				cancellable:true
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
			// trigger AfterMove callabacks
			this.publish('AfterMove', {
				direction: direction,
				last: evt.current,
				current: this.$currentItem
			});
			return this;
		},
		/**
		 * Select a suggestion
		 * @param {jQuery} $tag
		 * @return {jQuery.Suggester}
		 */
		selectItem: function($tag) {
			$tag.addClass('sugg-selected');
			return this;
		},
		/**
		 * Deselect a suggestion
		 * @param {jQuery} $tag
		 * @return {jQuery.Suggester}
		 */   
		deselectItem: function($tag) {
			$tag.removeClass('sugg-selected');
			return this;
		},
		/**
		 * Deselect all suggestions
		 * @return {jQuery.Suggester}
		 */     
		deselectAllItems: function() {
			this.$suggList.find('.sugg-item').removeClass('sugg-selected');
			this.$currentItem = null; 
			return this;
		},
		/**
		 * Open suggestion list for the given text
		 * @param {String} text
		 * @return {jQuery.Suggester}
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
		 * 
		 * @params {Object[]} data  More records in the same object format as initially set
		 * @return {jQuery.Suggester}
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
		 * 
		 * @params {Object[]} data
		 * @return {jQuery.Suggester}
		 */   
		setData: function(data) {
			this.data = [];
			this.addData(data);
			return this;
		},
		/**
		 * Get all the records in the autosuggest list. Does not apply when dataUrl is set
		 * 
		 * @return {Object[]}
		 */   
		getData: function() {
			return this.data;
		},
		/**
		 * Set the direction of the suggestion menu, to fly upwards or downwards
		 * 
		 * @param {String} direction  either "up" or "down"
		 * @return {jQuery.Suggester}
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
			// TODO: support auto?
			return this;
		},
		/**
		 * Focus on a previously added tag
		 * @params {jQuery} $tag  The .sugg-tag element to focus
		 * @return {jQuery.Suggester}
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
		 * @return {jQuery.Suggester}
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
		 * @param {jQuery.Event} evt (optional)  Used to check if $document keypress is backspace or delete
		 * @return {jQuery.Suggester}
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
		 * @param {String|jQuery|HTMLElement} $tag  the tag to remove
		 * @return {jQuery.Suggester}
		 */
		remove: function($tag) {
			var evt, value, removed;
			if (typeof $tag.nodeType == 'number' && typeof $tag.style == 'object') {
				$tag = $($tag);
			}
			if ($tag instanceof $) {
				value = $tag.data('tag-value');
			}
			else {
				value = $tag;
				$tag = false;
				$.each(this.tags, function() {
					if (value == this.value) {
						$tag = this.$tag;
						return false;
					}
				});
			}
			evt = this.publish('BeforeRemove', {
				tag: $tag,
				value: value,
				cancellable: true
			});
			if (evt.isDefaultPrevented()) {
				return this;
			}     
			removed = this._spliceTag(evt.value);
			this.publish('AfterRemove', {
				tag: evt.tag,
				value: value,
				removed: removed
			});
			return this;
		},
		/**
		 * Find a suggestion record by text
		 * 
		 * @param {String} text
		 * @return {Object}
		 */   
		findRecord: function(text) {
			var record, sugg, _break;
			_break = {};
			record = false;
			if (!this.options.caseSensitive) {
				text = text.toLowerCase();
			}
			sugg = this;
			try {
				$.each(this.getData(), function(i, item) {  
					$.each(sugg.options.searchProperties, function() {
						var value = '' + (item[this] || '');
						if (!sugg.options.caseSensitive) {
							value = value.toLowerCase();
						}
						if (value == text) {
							record = item;
							throw _break; // break out of both loops
						}
					});
				});
			}
			catch (e) {
				if (e !== _break) {
					throw e;
				}
			}
			return record;      
		},    
		/**
		 * Initiate suggestion process if the input text is >= this.options.minChars
		 * Otherwise show prompt
		 * 
		 * @return {jQuery.Suggester}
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
		 * Show the prompt text to give a hint to users
		 * Only called when there are no items and this.options.prompt is truthy
		 * 
		 * @return {jQuery.Suggester}
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
		 * Show text indicating there are no suggestions
		 * Text is defined in this.options.emptyText
		 * 
		 * @return {jQuery.Suggester}
		 */   
		showEmptyText: function() {
			if (!this.$empty) {
				return this;
			}
			this.$suggList.html('').append(this.$empty);
			this.openSuggestBox();
			this.$widget.addClass('sugg-empty-shown');
			return this;
		},
		/**
		 * Fetch suggestions from an ajax URL
		 * 
		 * @param {String} text  The text to search for
		 * @return {jqXHR}
		 * @event   BeforeAjax - allows you to edit settings before ajax is sent
		 * example  instance.bind('BeforeAjax', function(event) {
		 *              event.settings.type = 'post';
		 *          });
		 */
		fetchResults: function(text) {
			// TODO: add option to support a custom transport?
			// TODO: abort on keypress
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
			var evt = this.publish('BeforeAjax', {
				settings: settings,
				term: text
			});
			evt.settings.beforeSend = this._beforeFetch;
			return $.ajax(evt.settings).done(this._afterFetch);
		},
		/**
		 * Cancel the XHR. Used when user starts typing again before XHR completes
		 * 
		 * @return {jQuery.Suggester}
		 */
		abortFetch: function() {
			if (this._jqXHR) {
				this._jqXHR.abort();
			}
			return this;
		},
		/**
		 * Take result records and build and display suggestion box
		 * 
		 * @event BeforeSuggest (if event.preventDefault() is called, the suggestion list is built but not displayed)
		 *     event.text  The text that was searched for
		 *     example     instance.bind('BeforeSuggest', function(event) {
		 *                     if (evt.text == 'dont suggest') {
		 *                          event.preventDefault(); // suggest box will not open
		 *                     }
		 *                 });
		 * @event AfterSuggest
		 *     example     instance.bind('AfterSuggest', function(event) {
		 *                     alert('Choose a suggested item if you like.');
		 *                 });
		 */
		handleSuggestions: function(records) {
			if (!records || records.length === 0) {
				this.showEmptyText();
				return this;
			}
			var sugg = this;
			// clear out the suggestion list including all nodes and data
			sugg.$suggList.empty();
			$.each(records, function() {
				// TODO: format suggestion
				var $suggestion = $(sugg._formatSuggestion(this, sugg._text));
				$suggestion.data('tag-record', this);
				sugg.$suggList.append($suggestion);
			});
			var evt = this.publish('BeforeSuggest', {
				text: this._text,
				cancellable: true
			});
			if (evt.isDefaultPrevented()) {
				return this;
			}
			this.openSuggestBox();
			this.publish('AfterSuggest');
			return this;
		},
		/**
		 * Return true if suggestion box is open
		 * @return {Boolean}
		 */
		isSuggestBoxOpen: function() {
			return this.$suggList.css('display') != 'none';
		},
		/**
		 * Manually open the suggestion box in whatever state it is
		 * @return {jQuery.Suggester}
		 * @event BeforeOpen  (if event.preventDefault() is called, suggestion box will not open)
		 *     example  instance.bind('BeforeOpen', function(event) {
		 *                  event.preventDefault();
		 *                  alert('No suggestions for you!');
		 *              });
		 * @event AfterOpen
		 *     example  instance.one('AfterOpen', function(event) {
		 *          this.$suggList.css({
		 *            borderTopWidth: '10px',
		 *            borderTopColor: 'red'
		 *          });
		 *                  alert('Tip: You may choose an item from the suggestion list.');
		 *                  this.$suggList.css({
		 *            borderTopWidth: '0'
		 *          });
		 *              });
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
			evt = this.publish('BeforeOpen', {
				cancellable: true
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
			this.publish('AfterOpen');
			return this;      
		},
		/**
		 * Hide the suggestion list
		 * @return {jQuery.Suggester}
		 * @event BeforeClose  (if event.preventDefault() is called, suggestion box will not close)
		 *     example  instance.bind('BeforeClose', function(event) {
		 *                  event.preventDefault();
		 *                  window.location.href = '?page=' + instance.$currentItem.text();
		 *              });         
		 * @event AfterClose
		 *     example  instance.bind('AfterClose', function(event) {
		 *                 alert('You chose ' + instance.$currentItem.text());
		 *              }); 
		 */
		closeSuggestBox: function() {
			$document.unbind('click', this._closeOnOutsideClick);
			var evt = this.publish('BeforeClose', {
				cancellable:true
			});
			if (!evt.isDefaultPrevented()) {
				this.$suggList.hide();
				this.$widget.removeClass('sugg-list-open');
			}
			this.publish('AfterClose');
			return this;
		},
		/**
		 * Focus cursor on text input box
		 * @return {$.Suggester}
		 */
		focus: function() {
			// use the dom method to focus
			this.$input[0].focus();
			return this;
		},
		/**
		 * Get suggestion result records given some text (local data)
		 * @param {String} text  Gather suggestions based on this text
		 * @return {Array}  Array of Objects of matching records 
		 */
		getResults: function(text) {
			text = ''+text;
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
			this.publish('AfterFilter', {
				text: evt.text,
				results: results
			});
			return results;
		},
		clear: function() {
			$.each(this.tags, function() {
				this.getHidden().remove();
				this.getElement().remove(); 
			}); 
			this.tags = [];
			this.save();
			return this;
		},
		getTags: function() {
			return Array.prototype.slice.call(this.tags);
		},
		eachTag: function(iterator) {
			$.each(this.getTags(), iterator);
			return this;
		},
		serialize: function() {
			var query = [];
			$.each(this.tags, function() {
				var $hidden = this.getHidden();
				query.push(encodeURIComponent($hidden.name) + '=' + encodeURIComponent($hidden.value));
			});
			return query.join('&');
		},
		getValues: function() {
			var values = [];
			$.each(this.tags, function() {
				values.push(this.getValue);
			});
		},
		/**
		 * Set the widget's CSS theme - Adds a class "sugg-theme-%name%" to the widget
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
		 * 
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
		 * Get this instance. Useful for jQuery-ish usage:  var instance = $('input').suggester(options).suggester('getInstance')
		 * @return {$.Suggester}
		 */
		getInstance: function() {
			return this;
		},    
		/**
		 * Set options and interpret options
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
		 * @event BeforeRender - called after this.$widget is populated with this.options.template but before any sub elements are found
		 */
		_render: function() {
			// The full widget
			this.$widget = $(this.options.template);
			// BeforeRender callbacks now have the ability to modify this.$widget or any of its child elements
			this.publish('BeforeRender');
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
		},
		/**
		 * Look at the initial element's start value and populate tags as appropriate
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
			this.$input.bind('cut paste propertychange', $.proxy(this, '_onValueChange'));
			// auto add tags on submit
			this.$form.submit($.proxy(this, '_onSubmit'));
		},
		/**
		 * Event handler for when this.$input is focused
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
		 * @param {jQuery.Event} evt  blur event
		 */
		_onInputBlur: function(evt) {
			var inputVal = $.trim(this.$input.val());
			if (inputVal === this.options.placeholder) {
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
		 * @param {jQuery.Event} evt  The keydown event
		 */
		_onKeydown: function(evt) {
			var pubevent = this.publish('BeforeHandleKey', {
				keydown: evt,
				cancellable: true
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
			this.publish('AfterHandleKey', {
				keydown: evt
			});
		},
		/**
		 * Handle paste on this.$input
		 * @param {jQuery.Event} evt  The paste event
		 */
		_onValueChange: function(evt) {
			// when paste fires, input hasn't yet been populated so run on timeout
			setTimeout($.proxy(this._updateInputSize, this), 0);    
		},
		/**
		 * Handle UP key on this.$input
		 * @param {jQuery.Event} evt  The keydown event
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
		 * @param {jQuery.Event} evt  The keydown event
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
		 * @param {jQuery.Event} evt  The keydown event
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
		 * @param {jQuery.Event} evt  The keydown event
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
		 * @param {jQuery.Event} evt  The keydown event
		 */   
		_key_ESC: function(evt) {
			this.closeSuggestBox();     
		},
		/**
		 * Handle ENTER key on this.$input
		 * @param {jQuery.Event} evt  The keydown event
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
		 * @param {jQuery.Event} evt  The keydown event
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
		 * @event BeforeFetch (if event.preventDefault() is called, XHR is not made and suggest box does not open)
		 *     event.event  The jQuery-wrapped browser event
		 *     event.form   The input's form (same as this.$form)
		 *     example      instance.bind('BeforeSubmit', function(event) {
		 *                      // pretty much the same as instance.$form.submit(...)
		 *                      // used internally to add tag on submit if options.addOnSubmit is true
		 *                  });
		 */   
		_onSubmit: function(jqEvent) {
			var evt = this.publish('BeforeSubmit', {
				event: jqEvent,
				form: this.$form.get(0)
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
		 * Handler passed to $.ajax({beforeSend:...}) to alter XHR if needed
		 * 
		 * @event BeforeFetch (if event.preventDefault() is called, XHR is not made and suggest box does not open)
		 *     event.jqXHR  the jQuery XHR object (see http://api.jquery.com/jQuery.ajax/#jqXHR)
		 *     event.term   the term that is being searched for
		 *     example      instance.bind('BeforeFetch', function(event) {
		 *                      event.jqXHR.setRequestHeader('something','something');
		 *                      event.jqXHR.fail(function() {
		 *                          alert('ajax call failed');
		 *                      }).always(function() {
		 *              alert('ajax call finished regardless of success or failure');
		 *                      });
		 *                  });
		 */
		_beforeFetch: function(jqXHR) {
			this._jqXHR = jqXHR;
			var evt = this.publish('BeforeFetch', {
				jqXHR: this._jqXHR,
				term: this._searchTerm,
				cancellable: true
			});
			if (evt.isDefaultPrevented()) {
				this.abortFetch();
			}
		},
		/**
		 * Handler passed to $.ajax().done(function(){...}) that handles suggestion data that is returned
		 * 
		 * @event BeforeFetch (if event.preventDefault() is called, the suggest box does not open)
		 *     event.jqXHR    the jQuery XHR object (see http://api.jquery.com/jQuery.ajax/#jqXHR)
		 *     event.records  the object generated from the ajax returned from the XHR
		 *     event.term     the term that was search for
		 *     example        instance.bind('AfterFetch', function(event) {
		 *                         event.data.push({id:'', label:'Adding a test suggestion'});
		 *                    });
		 */   
		_afterFetch: function(records) {
			var evt = this.publish('AfterFetch', {
				jqXHR: this._jqXHR,
				records: records,
				term: this._searchTerm,
				cancellable: true
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
		 * @param {Object} record  The record that was suggested
		 * @param {String} substr  The string that generated the list of suggestions
		 * @return {String}  HTML to use as the item (e.g. '<li class="sugg-item">Suggestion</li>')
		 * @event BeforeFormat - use to do your own formatting
		 *     event.record  The record object that is being suggested
		 *     event.substr  The part of the string that matches the suggestion search fields
		 *     event.html    If you set event.html and then call event.preventDefault(), that html will be used instead of the default generated html
		 *     example       instance.bind('BeforeFormat', function(event) {
		 *                       event.preventDefault();
		 *                       event.html = '<li>My suggestion html</li>';
		 *                   });              
		 * @event AfterFormat - able to alter the html after it has be constructed
		 *     event.record  The record object that is being suggested
		 *     event.substr  The part of the string that matches the suggestion search fields
		 *     event.html    Another chance to alter the html of the item after it has been generated
		 *     example       instance.bind('AfterFormat', function(event) {
		 *                       event.preventDefault();
		 *                       event.html; // <li><strong class="sugg-match">Canis</strong> Major</li>
		 *                       event.html = event.html.replace(/<\/?strong\b/, 'em'),
		 *                   });
		 */
		_formatSuggestion: function(record, substr) {
			var evt, options, label, replacer, replacee, html;
			evt = this.publish('BeforeFormat', {
				record: record, 
				substr: substr, 
				html:'', 
				cancellable:true
			});
			if (evt.isDefaultPrevented()) {
				html = evt.html;
			}
			else {
				options = this.options;
				label = record[options.valueProperty];
				// handle case insensitive replacements
				replacer = options.caseSensitive ? evt.substr : new RegExp('(' + evt.substr + ')', 'i');
				replacee = options.caseSensitive ? evt.substr : '$1';
				// allow replacements of all {record.field} matches in this.listItemTemplate
				html = this.listItemTemplate.replace(/\{record\.(.+?)\}/g, function($0, $1) {
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
			evt = this.publish('AfterFormat', {
				record:evt.record,
				substr:evt.substr,
				html:html
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
		 * @return {jQuery.Suggester}
		 * @event  BeforeSave  (if canceled, original imput will not be populated with new value)
		 *     example  instance.bind('BeforeSave', function(event) {
		 *                  event.newValue += '!';
		 *              });
		 * @event  AfterSave
		 *     example  instance.bind('AfterSave', function(event) {
		 *                  saveToServer(event.newValue);
		 *              });
		 *      
		 */
		save: function() {
			var vals = [], newValue;
			$.each(this.tags, function() {
				vals.push(this.value.replace(/,/g, '\\,'));
			});
			newValue = vals.join(',');
			var evt = this.publish('BeforeSave', {
				cancellable: true,
				newValue: newValue
			});
			if (evt.isDefaultPrevented()) {
				return this.$originalInput.val();
			}
			this.$originalInput.val(evt.newValue);
			this.publish('AfterSave', {
				newValue: evt.newValue
			});
			return evt.newValue;
		},
		/**
		 * Given tag text, remove a tag from the internal collection and from the DOM
		 * 
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
		 * 
		 * @param {Number} idx  The index position in the internal collection
		 * @return {Object}  The record associated with that tag
		 */   
		_spliceTagByIdx: function(idx) {
			var tag = this.tags[idx];
			var newTags = [];
			var index = 0;
			$.each(this.tags, function(i) {
				if (i == idx) {
					this.$hidden.remove();
					this.$tag.remove();         
					return;
				}
				this.index = index++;
				newTags.push(this);
			});
			this.tags = newTags;
			return tag;
		},
		/**
		 * Find a tag given value
		 * 
		 * @param {String} value      The text of the tag
		 * @return {Number}  The index position of the tag in the internal collection or -1 if not found
		 */
		getTagIndex: function(value) {
			var idx = -1, i, len;
			for (i = 0, len = this.tags.length; i < len; i++) {
				if (this.tags[i].value == value) {
					idx = i;
					break;
				}
			}
			return idx;     
		},
		/**
		 * Setup publish/subscribe system that uses jQuery's event system
		 * Example event subscription:
		 * instance.bind('AfterFilter', myhandler)
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
		 * 
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
	$.Suggester.version = '1.0.2';
	/**
	 * Pass to contructor to subclass (e.g. `MySuggester.prototype = new $.Suggester($.Suggester.doSubclass)`)
	 * @var {Object}
	 */
	$.Suggester.doSubclass = {};
	/**
	 * a collection of all the instances
	 */
	$.Suggester.instances = [];
	/**
	 * Add data to all instances
	 * @param {Object[]} data  Add more data to all the registered instances
	 * @return {jQuery.Suggester}
	 */
	$.Suggester.addData = function(data) {
		$.each($.Suggester.instances, function() {
			this.addData(data);
		});
		return this;
	};
	/**
	 * Lightweight event handler to allow keydown to have less overhead
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
   * Create a subclass of jQuery.Suggester
   * 
   * @param {String} jQueryMethodName  The method name to add to jQuery.fn
   * @param {Object} properties  Properties and methods to add to subclass
   * @return {Function}  The new class object
   * 
   * @example
   *     var MySuggester = $.Suggester.subclass('mysuggester', {
   *         initialize: function($textInput, options) {
   *             options = options || {};
   *             this.options.myOption = options.myOptions || 'default';
   *             this.callParent('initialize', $textInput, options);
   *         }
   *     });
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
		/**
		 * Suggester jQuery Plugin
		 * 
		 * @param {Object} options  The options to use on instantiation (see jQuery.Suggester.defaultOptions for info on options)
		 * @return (Any)
		 */
		$.fn[name] = function(options) {    
			// handle where first arg is method name and additional args should be passed to that method
			if (typeof options == 'string' && typeof this.data('SuggesterInstance')[options] == 'function') {
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
		initialize: function(properties) {
			$.extend(this, properties);
		},
		getWidget: function() {
			return this.suggester;
		},
		remove: function() {
			this.suggester.remove(this.value);
			return this;
		},
		getIndex: function() {
			return this.index;
		},
		getValue: function() {
			return this.value;
		},
		setValue: function(value) {
			this.value = value;
			this.$hidden.val(value);
			this.suggester.save();
			return this;
		},
		getLabel: function() {
			return this.label;
		},
		setLabel: function(label) {
			this.label = label;
			this.$tag.text(label);
			return this;
		},
		getHidden: function() {
			return this.$hidden;
		},
		getElement: function() {
			return this.$tag;
		},
		getRecord: function() {
			return this.record;
		}
	};
}));  
