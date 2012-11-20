 /*
 * Suggester
 * Copyright 2012 Ken Snyder
 * GitHub: https://github.com/kensnyder/jQuery-Suggester
 * Demos: http://sandbox.kendsnyder.com/Suggester/demo.html
 *
 * Version 1.0, November 2012
 *
 * Turn a text input into a Gmail / Facebook-style auto-complete widget. Features include:
 *   - Load data from a JavaScript object, json, or jsonp
 *   - Powerful matching options
 *   - Populates original input with chosen tags but also creates hidden inputs with ids and tag text
 *   - Has methods to add a tag programmatically (e.g. user chooses a popular tag)
 *   - CSS is easy to extend and customize
 *   - You can subscribe to events that allow you to inject custom functionality into nearly every action
 *   - You can define your own HTML structure for the widget output
 *   - Object-oriented structure maskes for easy extendibility
 *  
 * Inspired by the AutoSuggest plugin by Drew Wilson
 *
 * Suggseter is licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */
(function($) { "use strict";
	// get our document once
	var $document = $(document);
	/**
	 * @constructor
	 */
	$.Suggester = function() {
		this.initialize.apply(this, Array.prototype.slice.call(arguments));
	};
	/**
	 * Default options. Change these to globally change the default options
	 * See below for comments on each option
	 */
	$.Suggester.defaultOptions = {
		// data to use instead of an ajax call
		data: false,
		// name of object property that should be used as the id
		idProperty: "id",            
		// name of object property that should be used as the tag display text
		labelProperty: "label",      
		// array of object property names that should be searched
		searchProperties: ["label"],
		// where to match when finding suggestions. anywhere|start|end or an integer
		matchAt: 'anywhere',
		// which way should the suggestion box fly
		// if "up", the suggestion box will exist before the input box
		// a css class of fly-up or fly-down is applied to the widget element
		fly: 'down',
		// url to call to get json or jsonp results. Use %s to indicate where search text should be inserted
		// e.g. http://example.com/myjson?query=%s
		// e.g. http://example.com/myjsonp?query=%s&callback=%s
		dataUrl: false,
		// can be json or jsonp
		// if json, url needs to have "callback" in the format http://example.com/myjsonp?query=%s&mycallback=%s
		// to handle xml, you'll need to register a BeforeFetch and afterFetch or overwrite the fetchResults function
		dataType: 'json',
		// if true, the first tag will be removed when a duplicate is typed in
		preventDuplicates: true,
		// if true, don't suggest items that have already been chosen as tags
		omitAlreadyChosenItems: true,
		// if true, fine matches regardless of case
		caseSensitive: false,
		// the minimum number of characters a user must type before the suggestion box will appear
		minChars: 3,
		// the number of milliseconds between keystrokes before the suggestion lookup begins
		keyDelay: 400,
		// if false, prevent the form from submitting when the user presses enter on the empty input
		submitOnEnter: false,
		// placeholder text to display when no tags are present
		// e.g. "Enter tags..."
		placeholder: '',
		// message to show when there are no matches
		noSuggestions: '(Type a comma to create a new tag)',
		// only display this many suggestions
		maxSuggestions: 10,
		// if true, wrap first matching substring in a suggestion with <strong class="sugg-match"></strong>
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
						'<li class="sugg-item {record.cssClass}">{record.label}</li>' + // innerHTML is used as this.listItemTemplate unless options.listItemTemplate is set
					'</ul>' +
				'</div>' +
			'</div>',
		listItemTemplate: null
		/* EVENTS
		 * onInitialize
		 * onBeforeRender
		 * onBeforeKeydown
		 * onBeforeFetch
		 * onAfterFetch
		 * onBeforeMove
		 * onAfterMove
		 * onBeforeSuggest
		 * onAfterSuggest
		 * onBeforeClose
		 * onAfterClose
		 * onBeforeFormat
		 * onAfterFormat
		 * onBeforeFilter
		 * onAfterFilter
		 * onBeforeAddTag
		 * onAfterAddTag
		 * onBeforeAddTagCustom
		 * onAfterAddTagCustom
		 * onBeforeRemove
		 * onAfterRemove
		 */
	};
	// Making Suggester a proper class allows two patterns:
	// var instance = $('selector').suggester(options).suggester('getInstance');
	// var instance = new $.Suggester('selector', options)
	$.Suggester.prototype = {
		/**
		 * Constructor
		 * @param {String|HTMLElement|jQuery} $textInput  The text input as a jQuery object, DOM element, or selector string
		 * @param {Object} options  An object with data and options (See $.Suggester.defaultOptions for explaination of options)
		 * @return {jQuery.Suggester}
		 */
		initialize: function($textInput, options) {
			// This is the original text input given
			this.$originalInput = $($textInput);
			// Bail because original input already has an instance .data('SuggesterInstance')
			if (this.$originalInput.data('SuggesterInstance')) {
				return this;
			}
			// register our instance
			$.Suggester.instances.push(this);
			if (this.$originalInput.length == 0) {
				// no input found. User could explicitly call initialize later
				// if not, there will likely be errors
				return this;
			}
			// our options are default options plus given options
			this._processOptions(options);
			// the preloaded list of suggestion records
			this.data = this.options.data || [];		
			// a collection of tags and tag data
			this.tags = [];
			// the name given to the hidden $input elements
			this.hiddenName = this.$originalInput.attr('name') + '_ids';
			// the name given to the hidden $input elements that are unknown tags
			this.customHiddenName = this.$originalInput.attr('name') + '_custom';
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
		 * Set options and interpret options
		 * 
		 * @params {Object} options
		 * @return {undefined}
		 */
		_processOptions: function(options) {
			this.options = $.extend({}, $.Suggester.defaultOptions, options);
			// interpret some overloaded options			
			if (this.options.matchAt == 'start' || this.options.matchAt == 'beginning') {
				this.options.matchAt = 0;
			}
		},
		/**
		 * Add more data records to the autosuggest list. Does not apply when dataUrl is set
		 * 
		 * @params {Object[]} data  More records in the same object format as initially set
		 * @return {jQuery.Suggester}
		 */
		addData: function(data) {
			this.data = this.data.concat(data);
			return this;
		},
		/**
		 * Set data records to the autosuggest list. Does not apply when dataUrl is set
		 * 
		 * @params {Object[]} data
		 * @return {jQuery.Suggester}
		 */		
		setData: function(data) {
			this.data = data;
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
		 * Render the widget and get handles to key elements
		 * @events
		 *   BeforeRender - called after this.$widget is populated with this.options.template but before any sub elements are found
		 * @return {undefined}
		 */
		_render: function() {
			// The full widget
			this.$widget = $(this.options.template).addClass('fly-' + this.options.fly);
			// BeforeRender callbacks now have the ability to modify this.$widget or any of its child elements
			this.publish('BeforeRender');
			// the container that tags and the input box are in
			this.$box = this.$widget.find('.sugg-box');
			// the template for tags
			this.$tagTemplate = this.$box.find('.sugg-tag').remove();
			// the text input used to type tags
			this.$input = this.$box.find('.sugg-input').val(this.options.placeholder || '').prop('size', 2);
			// the wrapper for that text input
			this.$inputWrapper = this.$box.find('.sugg-input-wrapper');
			// the list element that contains all suggestions
			this.$suggList = this.$widget.find('.sugg-list');
			// the template html to use for suggestions
			this.listItemTemplate = this.options.listItemTemplate || this.$suggList.html();			
			// we got that html, now empty it out
			this.$suggList.html('');
			// if the suggestion list should fly upwards instead of downwards, put the suggestion list before the input container in the dom tree
			if (this.options.fly == 'up') {
				this.$suggList.insertBefore(this.$box);
			}
			// actually insert the widget
			this.$widget.insertBefore(this.$originalInput.hide());
			// populate tags based on starting value of original input
			this._handleStartValue();
		},
		/**
		 * Look at the initial elements start value and populate tags as appropriate
		 */
		_handleStartValue: function() {
			// get a list of tags to insert now based on the current value of the original input
			// replaces escaped commas with \u0001 such that tag labels can have commas
			// if JavaScript RegExp supported lookbehinds we wouldn't need this \u0001 deal
			var startVal = this.$originalInput.val();
			if (startVal) {
				var existingTags = startVal.replace(/\\,/g, '\u0001,').split(/,/g);
				this.$originalInput.val('');
				var sugg = this;
				$.each(existingTags, function() {
					// add each tag by its label; this.$originalInput will get repopulated automatically
					sugg.addLabel($.trim(this.replace(/\u0001/g, '')));
				});
			}			
		},
		/**
		 * Attach event handlers
		 * @return {undefined}
		 */
		_setupListeners: function() {
			// proxy some methods to always be bound to our instance
			this.unfocusTag = $.proxy(this, 'unfocusTag');
			this.removeFocusedTag = $.proxy(this, 'removeFocusedTag');
			this.suggestIfNeeded = $.proxy(this, 'suggestIfNeeded');
			this._closeOnOutsideClick = $.proxy(this, '_closeOnOutsideClick');
			// clear default text if focused on input
			this.$input.focus($.proxy(this, '_onInputFocus'));
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
			this.$input.keydown($.proxy(this, '_onKeydown'));
		},
		/**
		 * Event handler for when this.$input is focused
		 */
		_onInputFocus: function(evt) {
			this.unfocusTag();
			if (this.$input.val() == this.options.placeholder) {
				this.$input.val('');
			}
		},
		/**
		 * Event handler for when .sugg-remove is clicked
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
		 */			
		_onListClick: function(evt) {
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
			this.addRecord($target.data('record'), $target);
			this.closeSuggestBox();
			this.$input.val('');
			this.focus();
		},
		/**
		 * Event handler for when this.$box is clicked
		 */			
		_onBoxClick: function(evt) {
			if (evt.target == this.$box[0]) {
				this.unfocusTag();
				this.focus();
			}
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
		 * Handle keypresses while in tag input field
		 * @param {jQuery.Event} evt
		 * @return {undefined}
		 */
		_onKeydown: function(evt) {
			var pubevent = this.publish('BeforeHandleKey', {
				event: evt,
				cancellable: true
			});
			if (pubevent.isDefaultPrevented()) {
				return;
			}
			if (evt.which == 38) { // Up
				this._key_UP(evt);
			}
			else if (evt.which == 40) { // Down
				this._key_DOWN(evt);
			}
			else if (evt.which == 8) { // Backspace
				this._key_BACKSPACE(evt);
			}
			else if (evt.which == 9 || evt.which == 188) {
				this._key_TAB_COMMA(evt);
			}
			else if (evt.which == 27) { // Esc
				this._key_ESC(evt);
			}
			else if (evt.which == 13) { // Enter
				this._key_ENTER(evt);
			}
			else {
				// any other key is pressed
				this._key_other(evt);
			}
			this.$input.prop('size', this.$input.val().length + 2);
			this.publish('AfterHandleKey', {
				event: evt
			});
		},
		/**
		 * Handle UP key on this.$input
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
		 */		
		_key_DOWN: function(evt) {
			evt.preventDefault();
			// unfocus any focused tags
			this.unfocusTag();
			if (this.isSuggestBoxOpen()) {
				// move selection down in suggestion box
				this.moveSelection('down');			
			}
			else {
				// user clicked away or pressed ESC so reopen suggestion box
				this.openSuggestBox();
			}
		},
		/**
		 * Handle BACKSPACE key on this.$input
		 */		
		_key_BACKSPACE: function(evt) {
			var $lastTag;
			this.$currentItem = null;
			// TODO: check that cursor is in first position, not for value == '' ?
			if (this.$input.val() == '') {
				evt.preventDefault();
				$lastTag = this.$inputWrapper.prev();
				if (this.$focusedTag && this.$focusedTag[0] == $lastTag[0]) {
					this.remove($lastTag);
				}
				else {
					this.$focusedTag = $lastTag;
					$lastTag.addClass('sugg-focused');
				}
				this.closeSuggestBox();
			}
			else {
				// update suggestions
				this._key_other(evt);
			}
		},
		/**
		 * Handle TAB and COMMA key on this.$input
		 */		
		_key_TAB_COMMA: function(evt) {
			if (evt.which == 9) { // tab
				if (this.$input.val() == '') {
					// go ahead and tab to next field
					return;
				}
			}
			// tab or comma
			evt.preventDefault();
			if (this.$input.val() == '') {
				// no value so don't create a new tag
				return;
			}
			this.$currentItem = null;
			this.addLabel(this.$input.val());
			this.$input.val('');
			this.closeSuggestBox();
		},
		/**
		 * Handle ESC key on this.$input
		 */		
		_key_ESC: function(evt) {
			this.closeSuggestBox();			
		},
		/**
		 * Handle ENTER key on this.$input
		 */
		_key_ENTER: function(evt) {
			if (this.$currentItem) {
				// add the item that was selected via arrow or hover
				this.addRecord(this.$currentItem.data('record'), this.$currentItem);
				this.$input.val('');
				this.closeSuggestBox();
				this.$currentItem = null;
			}
			else if (this.options.preventSubmit) {
				// don't let form submit
				evt.preventDefault();
			}			
		},
		/**
		 * Handle other keys (e.g. printable characters) on this.$input
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
		 * Initiate suggestion process if the input text is >= this.options.minChars
		 */
		suggestIfNeeded: function() {
			var text = this.$input.val();
			if (text.length >= this.options.minChars) {				
				this.suggest(text);
			}
			else {
				this.closeSuggestBox();
			}			
		},
		/**
		 * Completely remove Suggester widget and replace with original input box (with values populated)
		 */
		destroy: function() {
			// "un"-render; this.$originalInput should be already populated
			this.$originalInput.insertBefore(this.$widget).show();
			this.$widget.remove();
			// unregister our instance
			var sugg = this;
			$.each($.Suggester.instances, function(i) {
				if (sugg === this) {
					$.Suggester.instances = $.Suggester.instances.splice(i, 1);
					return false;
				}
			});
		},
		/**
		 * Fetch suggestions from an ajax URL
		 */
		fetchResults: function(text) {
			// TODO: add option to support other transports
			// TODO: abort on keypress
			this._searchTerm = text;
			var params = {
				context: this,
				beforeSend: this._beforeFetch,
				url: this.options.dataUrl.replace('%s', text)
			};
			if (this.options.dataType == 'json') {
				params.dataType = 'json';
			}
			else if (this.options.dataType == 'jsonp') {
				params.dataType = 'jsonp';
				// jQuery replaces second question mark with callback name
				params.url = params.url.replace('%s', '?');
			}
			else {
				throw new Error('jQuery.Suggester#fetchResults: options.dataType must be "json" or "jsonp".');
			}
			this._jqXHR = $.ajax(params).done(this._afterFetch);
		},
		/**
		 * Handler passed to $.ajax({beforeSend:...}) to alter XHR if needed
		 * 
		 * @event BeforeFetch (if event.preventDefault() is called, XHR is not made and suggest box does not open)
		 *     event.jqXHR  the jQuery XHR object (see http://api.jquery.com/jQuery.ajax/#jqXHR)
		 *     event.term   the term that is being searched for
		 *     example      instance.bind('BeforeFetch', function(event) {
		 *                      event.jqHXR.fail(function() {
		 *                          alert('ajax call failed');
		 *                      }).always(function() {
		 *							alert('ajax call finished regardless of success or failure');
		 *                      });
		 *                  });
		 */
		_beforeFetch: function() {
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
			if (records.length == 0) {
				this.showEmptyText();
				return this;
			}
			var sugg = this;
			sugg.$suggList.empty();
			$.each(records, function() {
				// TODO: format suggestion
				var $suggestion = $(sugg._formatSuggestion(this, sugg._text));
				$suggestion.data('record', this);
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
		 * @return {$.Suggestoer}
		 */
		openSuggestBox: function() {
			this.$suggList.show();
			this.$widget.addClass('sugg-list-open');
			$document.bind('click', this._closeOnOutsideClick);
			return this;			
		},
		/**
		 * Callback used to close the suggestion box when the user clicks off of it
		 * @return {undefined}
		 */
		_closeOnOutsideClick: function(evt) {
			if ($(evt.target).parents('.sugg-list')[0] == this.$suggList[0]) {
				return;
			}
			this.closeSuggestBox();
		}, 
		/**
		 * Close the suggestion list
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
			var evt = this.publish('BeforeClose', {cancellable:true});
			if (!evt.isDefaultPrevented()) {
				this.$suggList.hide();
				this.$widget.removeClass('sugg-list-open');
			}
			this.publish('AfterClose');
			return this;
		},
		/**
		 * Focus cursor on text input box
		 */
		focus: function() {
			// trigger our jQuery-attached focus callback to clear out placeholder text if needed
			this.$input.triggerHandler('focus');
			// use the dom method to focus
			this.$input[0].focus();
			return this;
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
				label = record[options.labelProperty];
				// handle case insensitive replacements
				replacer = this.options.caseSensitive ? evt.substr : new RegExp('(' + evt.substr + ')', 'i');
				replacee = this.options.caseSensitive ? evt.substr : '$1';
				// allow replacements of all {record.field} matches in this.listItemTemplate
				html = this.listItemTemplate.replace(/\{record\.(.+?)\}/g, function($0, $1) {
					var replacement = evt.record[$1];
					if (typeof replacement == 'string' || !!replacement) {
						if ($1 == options.labelProperty && options.hightlightSubstring) {						
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
		 * Get suggestion result records given some text (local data)
		 * @param {String} text
		 * @return {Array}  Array of Objects of matching records 
		 */
		getResults: function(text) {
			text = ''+text;
			var evt = this.publish('BeforeFilter', {
				text: text
			});			
			if (!this.options.caseSensitive) {
				evt.text = evt.text.toLowerCase();
			}			
			var sugg = this;
			var results = [];
			$.each(this.getData(), function(i, record) {	
				if (sugg.options.omitAlreadyChosenItems && sugg._tagExists(record)) {
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
						(sugg.options.matchAt == 'anywhere' && value.indexOf(evt.text) > -1) 
						|| (value.indexOf(evt.text) == sugg.options.matchAt)
						|| (sugg.options.matchAt == 'end' && value.indexOf(evt.text) == value.length - evt.text-length) 
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
		/**
		 * Show the empty text to show user when no suggestions are found
		 * @return {jQuery.Suggester}
		 */
		showEmptyText: function() {
			if (this.options.emptyText) {
				this.$suggList.html(this.options.emptyTemplate);
			}
			this.closeSuggestBox();
			return this;
		},
		/**
		 * Add a tag by id
		 * @param {String|Number}
		 * @return {jQuery|undefined} A jQuery object containing the new tag element
		 */
		addId: function(id) {
			var record = this.findRecordById(id);
			if (record) {
				return this.addRecord(record);
			}
			return undefined;
		},
		/**
		 * Add a tag by label, or any custom text
		 * @param {String} the label text
		 * @return {jQuery} The jQuery object containing the newly created label
		 */
		addLabel: function(label) {
			var record = this.findRecordByLabel(label);
			if (!record) {
				record = {_custom:label};
			}
			return this.addRecord(record);
		},
		/**
		 * Add a tag by a record
		 * @param {Object}  the record to add
		 * @param {jQuery}  Set when the record is added by choosing from the suggestion box
		 * @return {jQuery} The jQuery object containing the newly created label
		 */
		addRecord: function(record, $item/* optional*/) {
			var evt, id, label, val, idx, $hidden, name, $tag;
			evt = this.publish('BeforeAdd', {
				record: record,
				item: $item
			});
			if (evt.isDefaultPrevented()) {
				return undefined;
			}
			if (evt.record._custom) {
				label = evt.record._custom;
				name = this.customHiddenName;
				val = label;
			}
			else {
				id = evt.record[this.options.idProperty];
				label = evt.record[this.options.labelProperty];
				name = this.hiddenName;
				val = id;
			}
			if (this.options.preventDuplicates) {
				idx = this._findTag(id, label);
				if (idx > -1) {
					// duplicate: remove old and continue to add new so that new one will be at the end
					this._spliceTagByIdx(idx);
				}
			}
			$hidden = $('<input type="hidden" />').attr('name', name+'[]').val(val);
			this.$widget.append($hidden);
			$tag = this.$tagTemplate.clone().data('record', evt.record);
			this.tags.push({
				record: evt.record, 
				$tag: $tag, 
				$hidden: $hidden
			});
			$tag.find('.sugg-label').html(label);
			this.$inputWrapper.before($tag);
			this._populateOriginalInput();
			this.publish('AfterAdd', {
				record: evt.record,
				item: $item,
				tag: $tag,
				hidden: $hidden,
				value: val
			});
			return $tag;
		},
		/**
		 * Set the value of the original input to a comma-delimited set of labels
		 * @return {undefined}
		 */
		_populateOriginalInput: function() {
			var vals = [];
			this.$box.find('.sugg-label').each(function() {
				vals.push($(this).text().replace(/,/g, '\\,'));
			});
			this.$originalInput.val(vals.join(','));
		},
		/**
		 * Remove a tag given its jQuery element or record (or HTML element)
		 * @param {jQuery|Object|HTMLElement} $tag  the tag to remove
		 * @return {jQuery.Suggester}
		 */
		remove: function($tag) {
			var record, evt, id, label, info;
			if (typeof $tag.nodeType == 'number' && typeof $tag.style == 'object') {
				$tag = $($tag);
			}
			if ($tag instanceof $) {
				record = $tag.data('record');
			}
			else {
				record = $tag;
			}
			evt = this.publish('BeforeRemove', {
				tag: $tag,
				record: record,
				cancellable: true
			});
			if (evt.isDefaultPrevented()) {
				// don't remove anything
			}
			else if (!evt.record) {
				evt.tag.remove();
			}
			else {
				id = evt.record[this.options.idProperty];
				label = evt.record._custom || evt.record[this.options.labelProperty];
				info = this._spliceTag(id, label);
			}
			this.publish('AfterRemove', {
				tag: evt.tag,
				record: evt.record,
				info: info
			});
			return this;
		},
		/**
		 * Remove a tag from the internal collection and from the DOM
		 * 
		 * @param {String|Number} id  The id of the tag
		 * @param {String} label      The label of the tag
		 * @return {Object}  The record associated with that tag
		 */
		_spliceTag: function(id, label) {
			var idx = this._findTag(id, label);			
			if (idx > -1) {
				return this._spliceTagByIdx(idx);
			}
			return undefined;
		},
		_spliceTagByIdx: function(idx) {
			var info = this.tags[idx];
			info.$hidden.remove();
			info.$tag.remove();
			this.tags = this.tags.splice(idx-1, 1);
			return info;
		},
		_findTag: function(id, label) {
			var idx = -1, sugg;
			sugg = this;
			$.each(sugg.tags, function(i, info) {
				if (
					info.record[sugg.options.idProperty] == id
					|| (label && info.record[sugg.options.labelProperty] == label)
					|| (label && info.record._custom == label)
				) {
					idx = i;
					return false;
				}
			});
			return idx;			
		},
		_tagExists: function(record) {
			var exists = false;
			$.each(this.tags, function(i) {
				if (this.record == record) {
					exists = true;
					return false;
				}
			});
			return exists;				
		},
		removeId: function(id) {
			this._spliceTag(id, undefined);
			return this;
		},
		removeLabel: function(label) {
			this._spliceTag(undefined, label);
			return this;
		},		
		findRecordById: function(id) {
			var record, idProp;
			idProp = this.options.idProperty;
			$.each(this.getData(), function(i, item) {	
				if (item[idProp] == id) {
					record = item;
					return false;
				}
			});		
			return record;
		},
		findRecordByLabel: function(label) {
			var record, sugg, _break;
			_break = {};
			label = ''+label;
			record = false;
			if (!this.options.caseSensitive) {
				label = label.toLowerCase();
			}
			sugg = this;
			try {
				$.each(this.getData(), function(i, item) {	
					$.each(sugg.options.searchProperties, function() {
						var value = '' + (item[this] || '');
						if (!sugg.options.caseSensitive) {
							value = value.toLowerCase();
						}
						if (value == label) {
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
		_setupPubsub: function() {
			this.pubsub = $(this);
			this.on = $.proxy(this.pubsub, 'on');
			this.off = $.proxy(this.pubsub, 'off');
			this.bind = $.proxy(this.pubsub, 'bind');
			this.once = $.proxy(this.pubsub, 'once');
			this.unbind = $.proxy(this.pubsub, 'unbind');
			this.trigger = $.proxy(this.pubsub, 'trigger');
			// bind listeners passed in the options (e.g. onInitialize)
			for (var name in this.options) {
				if (name.match(/^on[A-Z0-9]/) && typeof this.options[name] == 'function') {
					this.bind(name.slice(2), this.options[name]);
				}
			}			
		},
		publish: function(type, data) {
			var evt = $.Event(type);
			evt.target = this;
			if (data) {
				$.extend(evt, data);
			}
			this.trigger(evt);
			return evt;
		},
		getInstance: function() {
			return this;
		}	
	};
	//
	// static properties and methods
	//
	/**
	 * a collection of all the instances
	 */
	$.Suggester.instances = [];
	/**
	 * Add data to all instances
	 * @param {Object[]}  Add more data to all the registered instances
	 * @return {jQuery.Suggester}
	 */
	$.Suggester.addData = function(data) {
		$.each($.Suggester.instances, function() {
			this.addData(data);
		});
		return this;
	};
	//
	// jQuery plugin
	//
	$.fn.suggester = function(options) {		
		// handle where first arg is method name and additional args should be passed to that method
		if (typeof options == 'string' && typeof $.Suggester.prototype[options] == 'function') {
			var args = Array.prototype.slice.call(arguments, 1);
			return $.Suggester.prototype[options].apply(this.data('SuggesterInstance'), args);
		}
		// otherwise create new $.Suggester instance but return the jQuery instance
		return this.each(function() {			
			var $elem = $(this);
			var instance = new $.Suggester($elem, options);
			$elem.data('SuggesterInstance', instance);
		});
	};
})(jQuery); 	
