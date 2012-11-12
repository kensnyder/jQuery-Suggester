 /*
 * Suggester
 * Copyright 2012 Ken Snyder
 * http://kendsnyder.com
 *
 * Version 1.0, 
 *
 * This Plug-In will auto-complete or auto-suggest completed search queries
 * for you as you type. You can add multiple selections and remove them on
 * the fly. It supports keybord navigation (UP + DOWN + RETURN), as well
 * as multiple AutoSuggest fields on the same page.
 *
 * Based on the AutoSuggest plugin by: Drew Wilson
 *
 * This Suggseter jQuery plug-in is dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
// TODO: fix up/down when there is only one suggestion
(function($) { "use strict";
	var $document = $(document);
	$.Suggester = function() {
		this.initialize.apply(this, Array.prototype.slice.call(arguments));
	};
	$.Suggester.defaultOptions = {
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
		// url to call to get jsonp results. Use first %s to indicate search text and second %s for callback
		// e.g. 
		jsonpUrl: false,
		// if true, the first tag will be removed when a duplicate is typed in
		preventDuplicates: true,
		// if true, fine matches regardless of case
		caseSensitive: false,
		// the minimum number of characters a user must type before the suggestion box will appear
		minChars: 3,
		// the minimum number of milliseconds between keystrokes before the suggestion lookup begins
		keyDelay: 400,
		// if false, prevent the form from submitting when the user presses enter on the empty input
		submitOnEnter: false,
		// placeholder text to display when no tags are present
		// e.g. "Enter tags..."
		placeholder: '',
		// message to show when there are no matches
		noSuggestions: '(Type a comma to create a new tag)',
		// stop looking for suggestions after this many are found (0 means no limit)		
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
				'<ul class="sugg-list" style="display:none">' + // this.$suggList
					'<li class="sugg-item {record.cssClass}">{record.label}</li>' + // innerHTML is used as this.listItemTemplate
				'</ul>' +
			'</div>'
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
		 * @return {$.Suggester}
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
			// a hash of tag id to $tag elements
			this.tags = {};
			// a hash of tag label to $tag elements
			this.customTags = {};
			// a hash of tag id to hidden input $input elements
			this.hiddens = {};
			// the name given to the hidden $input elements
			this.hiddenName = this.$originalInput.attr('name') + '_ids';
			// a hash of tag label to hidden $input elements
			this.customHiddens = {};
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
			this._publish('Initialize');
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
		addData: function(data) {
			this.data = this.data.concat(data);
			return this;
		},
		setData: function(data) {
			this.data = data;
			return this;
		},
		getData: function(data) {
			return this.data;
		},
		/**
		 * Render the widget and get handles to key elements
		 * @events
		 *   BeforeRender - called after this.$widget is populated with this.options.template but before any sub elements are found
		 *   AfterRender - called after this.$widget is inserted into the dom
		 * @return {undefined}
		 */
		_render: function() {
			// The full widget
			this.$widget = $(this.options.template).addClass('fly-' + this.options.fly);
			// BeforeRender callbacks now have the ability to modify this.$widget or any of its child elements
			this._publish('BeforeRender');
			// the container that tags and the input box are in
			this.$box = this.$widget.find('.sugg-box');
			// the template for tags
			this.$tagTemplate = this.$box.find('.sugg-tag').remove();
			// the text input used to type tags
			this.$input = this.$box.find('.sugg-input').val(this.options.placeholder || '');
			// the wrapper for that text input
			this.$inputWrapper = this.$box.find('.sugg-input-wrapper');
			// the list element that contains all suggestions
			this.$suggList = this.$widget.find('.sugg-list');
			// the template html to use for suggestions
			this.listItemTemplate = this.$suggList.html();			
			// we got that html, now empty it out
			this.$suggList.html('');
			// if the suggestion list should fly upwards instead of downwards, put the suggestion list before the input container in the dom tree
			if (this.options.fly == 'up') {
				this.$suggList.insertBefore(this.$box);
			}
			// actually insert the widget
			this.$widget.insertBefore(this.$originalInput.hide());
			this._handleStartValue();
		},
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
					sugg.addTag($.trim(this.replace(/\u0001/g, '')));
				});
			}			
		},
		/**
		 * Attach event handlers
		 * @return {undefined}
		 */
		_setupListeners: function() {
			var sugg = this;
			// proxy some methods to always be bound to our instance
			this.unfocusTag = $.proxy(this, 'unfocusTag');
			this.removeFocusedTag = $.proxy(this, 'removeFocusedTag');
			this.suggestIfNeeded = $.proxy(this, 'suggestIfNeeded');
			// clear default text if focused on input
			this.$input.focus($.proxy(this, '_onInputFocus'));
			// remove tags when `X` is clicked
			this.$box.delegate('.sugg-remove', 'click', $.proxy(this, '_onTagRemoveClick'));
			// focus tags when clicked
			this.$box.delegate('.sugg-tag', 'click', $.proxy(this, '_onTagClick'));
			// highlight suggestion on mouseover
			this.$suggList.mouseover($.proxy(this, '_onListMouseover'));
			// add a tag when suggestion is clicked
			this.$suggList.click($.proxy(this, '_onListClick'));
			// focus to text input field when a click comes outside of any tags
			this.$box.click($.proxy(this, '_onBoxClick'));
			// handle various actions associated with keypresses
			this.$input.keydown($.proxy(this, '_keydown'))
		},
		_onInputFocus: function(evt) {
			this.unfocusTag();
			if (this.$input.val() == this.options.placeholder) {
				this.$input.val('');
			}
		},
		_onTagRemoveClick: function(evt) {
			this.unfocusTag();
			evt.preventDefault();
			evt.stopImmediatePropagation();
			var label = $(evt.target).parents('.sugg-tag').attr('data-label');
			this.removeLabel(label);
		},
		_onTagClick: function(evt) {
			// we have to stop propagation to $box click and to $document
			evt.stopImmediatePropagation();
			this.focusTag($(evt.target));	
		},
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
			this.addTag($target.text());
			this.closeSuggestBox();
			this.$input.val('');
			this.focus();
		},
		_onBoxClick: function(evt) {
			if (evt.target == this.$box[0]) {
				this.unfocusTag();
				this.focus();
			}
		},
		/**
		 * Focus on a previously added tag
		 * @params {jQuery} $tag  The .sugg-tag element to focus
		 * @return {$.Suggester}
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
		 * @return {$.Suggester}
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
		 * @param {jQuery.Event} evt (optional)  Used to check if keypress is backspace or delete
		 * @return {$.Suggester}
		 */
		removeFocusedTag: function(evt) {
			if (evt && evt.which && (evt.which == 8 || evt.which == 46)) {
				// delete or backspace key								
				if (this.$focusedTag) {
					this.removeLabel(this.$focusedTag.attr('data-label'));
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
		_keydown: function(evt) {
			var pubevent = this._publish('BeforeKeydown', {
				event: evt,
				cancellable: true
			});
			if (pubevent.isDefaultPrevented()) {
				return;
			}
			switch (evt.which) {
				case 38: // Up
					this._key_UP(evt);
					return;
				case 40: // Down
					this._key_DOWN(evt);
					return;
				case 8: // Backspace
					this._key_BACKSPACE(evt);
					break;
				case 9: // tab
				case 188: // comma
					this._key_TAB_COMMA(evt);
					return;
				case 27: // Esc
					this._key_ESC(evt);
					return;
				case 13: // Enter
					this._key_ENTER(evt);
					return;
			}
			// any other key is pressed
			this._key_other(evt);
		},
		_key_UP: function(evt) {
			evt.preventDefault();
			// unfocus any focused tags
			this.unfocusTag();
			// move selection up in suggestion box
			this.moveSelection('up');			
		},
		_key_DOWN: function(evt) {
			evt.preventDefault();
			// unfocus any focused tags
			this.unfocusTag();
			// move selection down in suggestion box
			this.moveSelection('down');			
		},
		_key_BACKSPACE: function(evt) {
			this.$currentItem = null;
			// TODO: check that cursor is in first position, not for value == '' ?
			if (this.$input.val() == '') {
				evt.preventDefault();
				var $lastTag = this.$inputWrapper.prev();
				if (this.$focusedTag && this.$focusedTag[0] == $lastTag[0]) {
					this.removeId($lastTag.attr('data-id'));
				}
				else {
					this.$focusedTag = $lastTag;
					$lastTag.addClass('sugg-focused');
				}
				return;
			}			
		},
		_key_TAB_COMMA: function(evt) {
			if (evt.which == 9) { // tab
				
				if (this.$input.val() == '') {
					// go ahead and tab to next field
					return;
				}
			}
			evt.preventDefault();
			if (this.$input.val() == '') {
				// no value so do nothing
				return;
			}
			this.$currentItem = null;
			this.addTag(this.$input.val());
			this.$input.val('');
			this.closeSuggestBox();
			return;			
		},
		_key_ESC: function(evt) {
			this.closeSuggestBox();			
		},
		_key_ENTER: function(evt) {
			if (this.$currentItem) {
				// add the item that was selected via arrow or hover
				this.addTag(this.$currentItem.text());
				this.$input.val('');
				this.closeSuggestBox();
				this.$currentItem = null;
			}
			else if (this.options.preventSubmit) {
				// don't let form submit
				evt.preventDefault();
			}			
		},
		_key_other: function(evt) {
			// abort any outstanding xhr requests and clear timeout from key delay
			this._abortFetch();
			// clear key delay
			clearTimeout(this.timeoutHandle);
			// remove suggestion box selection
			this.$currentItem = null;
			// unfocus any tags selected for deletion
			this.unfocusTag();
			// start the timeout
			this.timeoutHandle = setTimeout(this.suggestIfNeeded, this.options.keyDelay || 0);			
		},
		suggestIfNeeded: function() {
			var text = this.$input.val();
			if (text.length >= this.options.minChars) {				
				this.suggest(text);
			}
			else {
				this.closeSuggestBox();
			}			
		},
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
				throw new Error('jQuery.Suggester#fetchResults: dataType must be json or jsonp.');
			}
			this._jqXHR = $.ajax(params).done(this._afterFetch);
		},
		_beforeFetch: function() {
			var evt = this._publish('BeforeFetch', {
				jqXHR: this._jqXHR,
				term: this._searchTerm,
				cancellable: true
			});
			if (evt.isDefaultPrevented()) {
				this._abortFetch();
			}
		},
		_afterFetch: function(data) {
			var evt = this._publish('AfterFetch', {
				jqXHR: this._jqXHR,
				data: data,
				term: this._searchTerm,
				cancellable: true
			});
			this._jqXHR = null;
			if (evt.isDefaultPrevented()) {
				return;
			}
			this.handleSuggestions(evt.data);
		},
		_abortFetch: function() {
			if (this._jqXHR) {
				this._jqXHR.abort();
			}
		},
		/**
		 * Move the selection up or down in the suggestion box
		 * @events
		 *   BeforeMove
		 *   AfterMove
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
			var evt = this._publish('BeforeMove', {
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
			this._publish('AfterMove', {
				direction: direction,
				last: evt.current,
				current: this.$currentItem
			});
			return this;
		},
		/**
		 * Select a suggestion
		 * @param {jQuery} $tag
		 * @return {$.Suggester}
		 */
		selectItem: function($tag) {
			$tag.addClass('sugg-selected');
			return this;
		},
		/**
		 * Deselect a suggestion
		 * @param {jQuery} $tag
		 * @return {$.Suggester}
		 */		
		deselectItem: function($tag) {
			$tag.removeClass('sugg-selected');
			return this;
		},
		/**
		 * Deselect all suggestions
		 * @return {$.Suggester}
		 */			
		deselectAllItems: function() {
			this.$suggList.find('.sugg-item').removeClass('sugg-selected');
			this.$currentItem = null;	
			return this;
		},
		/**
		 * Open suggestion list for the given text
		 * @param {String} text
		 * @return {$.Suggester}
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
		handleSuggestions: function(records) {
			if (records.length == 0) {
				this.showEmptyText();
				return this;
			}
			var html = '';
			var sugg = this;
			$.each(records, function() {
				// TODO: format suggestion
				html += sugg._formatSuggestion(this, sugg._text);
			});
			this.$suggList.html(html);
			var evt = this._publish('BeforeSuggest', {
				text: this._text,
				cancellable: true
			});
			if (evt.isDefaultPrevented()) {
				return this;
			}			
			this.$suggList.show();
			$document.bind('click.sugg', function(evt) {
				if ($(evt.target).parents('.sugg-list')[0] == sugg.$suggList[0]) {
					return;
				}
				sugg.closeSuggestBox();
			});
			this._publish('AfterSuggest');
			return this;
		},
		/**
		 * Close the suggestion list
		 * @return {$.Suggester}
		 * @events
		 *   BeforeClose - triggered before close. if preventDefault is called, it will not close
		 *   AfterClose - triggered after suggest box closes
		 */
		closeSuggestBox: function() {
			$document.unbind('click.sugg');
			var evt = this._publish('BeforeClose', {cancellable:true});
			if (!evt.isDefaultPrevented()) {
				this.$suggList.hide();
			}
			this._publish('AfterClose');
			return this;
		},
		/**
		 * Focus cursor on text box
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
		 * @events
		 *   Format - callbacks can return the HTML to use to display a suggestion item; if it preventsDefault, the event's html property is used
		 *   AfterFormat - able to alter the html after it has be constructed
		 */
		_formatSuggestion: function(record, substr) {
			var evt, options, label, replacer, replacee, html;
			evt = this._publish('BeforeFormat', {record:record, substr:substr, html:'', cancellable:true});
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
			evt = this._publish('AfterFormat', {record:evt.record, substr:evt.substr, html:html});
			return evt.html;
		},
		/**
		 * Get suggestion result records given some text
		 * @param {String} text
		 * @return {Array}  Array of Objects of matching records 
		 */
		getResults: function(text) {
			text = ''+text;
			var evt = this._publish('BeforeFilter', {
				text: text
			});			
			if (!this.options.caseSensitive) {
				evt.text = evt.text.toLowerCase();
			}			
			var sugg = this;
			var results = [];
			$.each(this._getData(), function(i, item) {	
				if (sugg.tags[item[sugg.options.idProperty]] || sugg.tags[item[sugg.options.labelProperty]]) {
					// tag already exists so don't suggest it
					// skip loop
					return;
				}
				$.each(sugg.options.searchProperties, function() {
					var value = '' + (item[this] || '');
					if (!sugg.options.caseSensitive) {
						value = value.toLowerCase();
					}
					if (
						(sugg.options.matchAt == 'anywhere' && value.indexOf(evt.text) > -1) 
						|| (value.indexOf(evt.text) == sugg.options.matchAt)
						|| (sugg.options.matchAt == 'end' && value.indexOf(evt.text) == value.length - evt.text-length) 
					) {
						results.push(item);
						return false;
					}
				});
				if (sugg.options.maxSuggestions > 0 && results.length >= sugg.options.maxSuggestions) {
					// exit the loop
					return false;
				}
			});
			this._publish('AfterFilter', {
				text: evt.text,
				results: results
			});
			return results;
		},
		/**
		 * Show the empty text to show user when no suggestions are found
		 * @return {$.Suggester}
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
			var record = this._findById(id);
			if (record) {
				var label = record[this.options.labelProperty];
				return this.add(id, label);
			}
			return undefined;
		},
		addTag: function(label) {
			var $tag;
			var record = this._findByLabel(label);
			var evt = this._publish('BeforeAddTag', {
				label: label,
				record: record,
				isCustom: !!record,
				cancelable: true
			});
			if (evt.isDefaultPrevented()) {
				return this;
			}
			if (evt.record) {
				var id = evt.record[this.options.idProperty];
				$tag = this.add(id, evt.label);							
			}
			else {
				evt = this._publish('BeforeAddTagCustom', {
					label: evt.label,
					cancelable: true
				});
				if (evt.isDefaultPrevented()) {
					return this;
				}
				$tag = this.addCustom(evt.label);
				this._publish('AfterAddTagCustom', {
					label: evt.label
				});
			}
			this._publish('AfterAddTag', {
				label: evt.label,
				record: evt.record
			});
			return $tag;
		},
		addCustom: function(label) {
			if (this.options.preventDuplicates && this.customHiddens[label]) {
				// duplicate: remove old and add new so that it will be at the end
				this.removeLabel(label);
			}
			var $hidden = $('<input type="hidden" />').attr('name', this.customHiddenName+'[]').val(label);
			this.customHiddens[label] = $hidden;
			this.$widget.append($hidden);
			var $tag = this.$tagTemplate.clone().attr('data-id', '').attr('data-label', label).addClass('sugg-custom');			
			this.customTags[label] = $tag;
			$tag.find('.sugg-label').html(label);
			this.$inputWrapper.before($tag);
			this._populateOriginalInput();
			return $tag;
		},
		add: function(id, label) {
			var evt = this._publish('BeforeAdd', {id:id, label:label});
			if (evt.preventDefault()) {
				return undefined;
			}
			if (this.options.preventDuplicates && this.hiddens[evt.id]) {
				// duplicate: remove old and add new so that it will be at the end
				this.removeId(evt.id);
			}
			var $hidden = $('<input type="hidden" />').attr('name', this.hiddenName+'[]').val(evt.id);
			this.hiddens[evt.id] = $hidden;
			this.$widget.append($hidden);
			var $tag = this.$tagTemplate.clone().attr('data-id', evt.id).attr('data-label', evt.label);
			this.tags[evt.id] = $tag;
			$tag.find('.sugg-label').html(evt.label);
			this.$inputWrapper.before($tag);
			this._populateOriginalInput();
			this._publish('AfterAdd', {id:evt.id, label:evt.label, tag:$tag});
			return $tag;
		},
		_populateOriginalInput: function() {
			var vals = [];
			this.$box.find('.sugg-label').each(function() {
				vals.push($(this).text().replace(/,/g, '\\,'));
			});
			this.$originalInput.val(vals.join(','));
		},
		removeId: function(id) {
			var $tag = this.tags[id];
			var evt = this._publish('BeforeRemove', {tag:$tag, cancellable:true});
			if (evt.isDefaultPrevented()) {
				return undefined;
			}
			if ($tag) {
				$tag.remove();
				this.tags[id] = null;
			}
			var $hidden = this.hiddens[id];
			if ($hidden) {
				$hidden.remove();
				// don't use `delete` here because compilers can't optimize the code
				this.hiddens[id] = null;
			}
			this._publish('AfterRemove', {tag:$tag});
			return this;
		},
		removeLabel: function(label) {
			if (this.customTags[label]) {
				this._publish('BeforeRemove', {tag:this.customTags[label]});
				this.customTags[label].remove();
				this.customTags[label] = null;
				this.customHiddens[label].remove();
				this.customHiddens[label] = null;
				this._publish('AfterRemove');
				return this;
			}
			else {
				var record = this._findByLabel(label);		
				if (record) {
					this.removeId(record[this.options.idProperty]);
				}
				return this;
			}
		},		
		_findById: function(id) {
			var record = false;
			var idProperty = this.options.idProperty;
			$.each(this._getData(), function() {
				if (this[idProperty] == id) {
					record = this;
					return false;
				}
			});			
			return record;
		},
		_findByLabel: function(label) {
			label = ''+label;
			var record = false;
			if (!this.options.caseSensitive) {
				label = label.toLowerCase();
			}
			var sugg = this;
			try {
				$.each(this._getData(), function(i, item) {	
					$.each(sugg.options.searchProperties, function() {
						var value = '' + (item[this] || '');
						if (!sugg.options.caseSensitive) {
							value = value.toLowerCase();
						}
						if (value == label) {
							record = item;
							throw '';
						}
					});
				});
			}
			catch (e) {}
			return record;			
		},
		_getData: function() {
			return this.data
		},
		_setupPubsub: function() {
			this.pubsub = $({});
			this.bind = $.proxy(this.pubsub, 'bind');
			this.unbind = $.proxy(this.pubsub, 'unbind');
			this.trigger = $.proxy(this.pubsub, 'trigger');
			this.one = $.proxy(this.pubsub, 'one');
			// bind listeners passed in the options (e.g. onInitialize)
			for (var name in this.options) {
				if (name.match(/^on[A-Z0-9]/) && typeof this.options[name] == 'function') {
					this.bind(name.slice(2), this.options[name]);
				}
			}			
		},
		_publish: function(type, data) {
			var evt = $.Event(type);
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
	 * @return {$.Suggester}
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
		// create new instance but return the jQuery instance
		return this.each(function(i) {			
			var $elem = $(this);
			var instance = new $.Suggester($elem, options);
			$elem.data('SuggesterInstance', instance);
		});
	};
})(jQuery); 	
