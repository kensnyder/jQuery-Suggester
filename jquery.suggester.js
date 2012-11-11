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
		// where to match. anywhere|start|end or an integer
		matchAt: 'anywhere',
		// which way should the suggestion box fly
		// if down, the suggestion box will exist before the input box
		// a css class of fly-up or fly-down is applied to the widget element
		fly: 'down',
		// url to call to get results. Use %s to indicate where search text should be inserted
		// e.g. http://domain.com/suggestions/?query=%s
		ajaxUrl: false, 
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
		placeholder: '',
		// message to show when there are no matches
		noSuggestions: '(Type a comma to create a new tag)',
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
		/* EVENT OPTIONS
		 * onInitialize
		 * onBeforeAdd
		 * onAfterAdd
		 * onBeforeRender
		 * onAfterRender
		 * onBeforeRemove
		 * onAfterRemove
		 * onCustomTag
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
			// register our instance
			$.Suggester.instances.push(this);
			// This is the original text input given
			this.$originalInput = $($textInput);
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
			// get a list of tags to insert now based on the current value of the original input
			// replace escaped commas with \u0001 such that tag labels can have commas
			if (this.$originalInput.val().length) {
				var existingTags = this.$originalInput.val().replace(/\\,/g, '\u0001').split(/,/g);
				var sugg = this;
				$.each(existingTags, function() {
					// add each tag by its label; this.$originalInput will get repopulated automatically
					sugg.addTag($.trim(this.replace(/\u0001/g, ',')));
				});
			}
		},
		/**
		 * Set up event handlers
		 * @return {undefined}
		 */
		_setupListeners: function() {
			var sugg = this;
			// proxy our unfocusTag and removeFocusedTag methods so we can bind and unbind to $(document)
			this.unfocusTag = $.proxy(this, 'unfocusTag');
			this.removeFocusedTag = $.proxy(this, 'removeFocusedTag');
			// clear default text if focused on input
			this.$input.focus(function() {
				sugg.unfocusTag();
				if (sugg.$input.val() == sugg.options.placeholder) {
					sugg.$input.val('');
				}
			});
			// remove tags when `X` is clicked
			this.$box.delegate('.sugg-remove', 'click', function(evt) {
				sugg.unfocusTag();
				evt.preventDefault();
				evt.stopImmediatePropagation();
				var label = $(this).parents('.sugg-tag').attr('data-label');
				sugg.removeLabel(label);
			});
			// focus tags when clicked
			this.$box.delegate('.sugg-tag', 'click', function(evt) {	
				// we have to stop propagation to $box click and to $document
				evt.stopImmediatePropagation();
				sugg.focusTag($(this));	
			});
			// highlight suggestion on mouseover
			this.$suggList.mouseover(function(evt) {	
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
				sugg.deselectAllItems();
				sugg.selectItem($target);
				sugg.$currentItem = $target;
			});
			// add a tag when suggestion is clicked
			this.$suggList.click(function(evt) {
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
				sugg.addTag($target.text());
				sugg.closeSuggestBox();
				sugg.$input.val('');
				sugg.focus();
			});
			// focus to text input field when a click comes outside of any tags
			this.$box.click(function(evt) {
				if (evt.target == sugg.$box[0]) {
					sugg.unfocusTag();
					sugg.focus();
				}
			});
			// handle various actions associated with keypresses
			this.$input.keydown($.proxy(this, '_keydown'))
		},
		/**
		 * Focus on a previously added tag
		 * @params {jQuery} $tag  The .sugg-tag element to focus
		 * @return $.Suggester
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
		 * @return $.Suggester
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
		 * @return $.Suggester
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
				case 38: // up
					evt.preventDefault();
					// unfocus any focused tags
					this.unfocusTag();
					// move selection up in suggestion box
					this.moveSelection('up');
					return;
				case 40: // down
					evt.preventDefault();
					// unfocus any focused tags
					this.unfocusTag();
					// move selection down in suggestion box
					this.moveSelection('down');
					return;
				case 8: // backspace
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
					break;
				case 9: // tab
					if (this.$input.val() == '') {
						// go ahead and tab to next field
						return;
					}
					// otherwise, continue as a comma and create a new tag
				case 188: // comma
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
				case 27: // Esc
					this.closeSuggestBox();
					return;
				case 13: // return
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
					return;
			}
			// other keys:
			// clear timeout from key delay
			clearTimeout(this.timeoutHandle);
			this.$currentItem = null;
			this.unfocusTag();
			var sugg = this;
			var doSuggest = function() {
				var text = sugg.$input.val();
				if (text.length >= sugg.options.minChars) {				
					sugg.suggest(text);
				}
				else {
					sugg.closeSuggestBox();
				}
			};
			this.timeoutHandle = setTimeout(doSuggest, this.options.keyDelay || 0);
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
			if (this.$currentItem) {				
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
				next: $nextItem
			});
			// allow BeforeMove callbacks to cancel movement
			if (evt.isDefaultPrevented()) {
				return this;
			}
			// deselect current item
			if (this.$currentItem) {
				this.deselectItem(this.$currentItem);
			}
			// move to next item
			if ($nextItem) {
				this.selectItem($nextItem);
			}
			// reset our current items
			var $lastItem = this.currentItem;
			this.$currentItem = $nextItem;
			// trigger AfterMove callabacks
			this._publish('AfterMove', {
				direction: direction,
				last: $lastItem,
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
			// TODO: make async given that getResults may need to get it by ajax
			var records = this.getResults(text);
			if (records.length == 0) {
				this.showEmptyText();
				return this;
			}
			var html = '';
			var sugg = this;
			$.each(records, function() {
				// TODO: format suggestion
				html += sugg._formatSuggestion(this, text);
			});
			this.$suggList.html(html);
			var evt = this._publish('BeforeSuggest', {
				text: text,
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
			var evt = this._publish('BeforeClose');
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
			evt = this._publish('Format', {record:record, substr:substr, html:''});
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
						if ($1 == options.labelProperty) {						
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
					return;
				}
				$.each(sugg.options.searchProperties, function() {
					var value = '' + (item[this] || '');
					if (!sugg.options.caseSensitive) {
						value = value.toLowerCase();
					}
					if (
						(sugg.options.matchAt == 'anywhere' && value.indexOf(evt.text) > -1) 
						|| (sugg.options.matchAt == 'end' && value.indexOf(evt.text) == value.length - evt.text-length) 
						|| (value.indexOf(evt.text) == sugg.options.matchAt) 
					) {
						results.push(item);
						return false;
					}
				});
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
		 * @return {jQuery|undefined}
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
				label = evt.record[this.options.labelProperty];
				$tag = this.add(id, label);							
			}
			else {
				evt = this._publish('BeforeAddTagCustom', {
					label: evt.label,
					cancelable: true
				});
				if (evt.isDefaultPrevented()) {
					return this;
				}
				$tag = this.addCustom(label);
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
			if (this.options.preventDuplicates && this.hiddens[id]) {
				// duplicate: remove old and add new so that it will be at the end
				this.removeId(id);
			}
			var $hidden = $('<input type="hidden" />').attr('name', this.hiddenName+'[]').val(id);
			this.hiddens[id] = $hidden;
			this.$widget.append($hidden);
			var $tag = this.$tagTemplate.clone().attr('data-id', id).attr('data-label', label);
			this.tags[id] = $tag;
			$tag.find('.sugg-label').html(label);
			this.$inputWrapper.before($tag);
			this._populateOriginalInput();
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
			return this;
		},
		removeLabel: function(label) {
			if (this.customTags[label]) {
				this.customTags[label].remove();
				this.customTags[label] = null;
				this.customHiddens[label].remove();
				this.customHiddens[label] = null;
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
			this.bind = this.pubsub.bind;
			this.unbind = this.pubsub.unbind;
			this.trigger = this.pubsub.trigger;
			this.one = this.pubsub.one;
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
			//this.trigger(evt);
			return evt;
		},
		getInstance: function() {
			return this;
		}	
	};
	//
	// static methods
	//
	$.Suggester.instances = [];
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
		if (typeof options == 'string' && typeof $.Suggester.prototype[options] == 'function') {
			var args = Array.prototype.slice.call(arguments, 1);
			return $.Suggester.prototype[options].apply(this.data('SuggesterInstance'), args);
		}
		return this.each(function(i) {			
			var $elem = $(this);
			var instance = new $.Suggester($elem, options);
			$elem.data('SuggesterInstance', instance);
		});
	};
})(jQuery); 	
