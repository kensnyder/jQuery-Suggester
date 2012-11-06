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
		idProperty: "id",            // name of object property that should be used as the id
		labelProperty: "label",      // name of object property that should be used as the tag text
		searchProperties: ["label"], // array of object property names that should be searched
		reduceFunction: false,
		matchAnywhere: true,
		fly: 'down',
		ajaxUrl: false, // e.g. http://domain.com/suggestions/?query=%s
		preventDuplicates: true,
		caseSensitive: false,
		minChars: 3,
		keyDelay: 400,
		submitOnEnter: false,
		customHiddenName: false,
		placeholder: 'Enter tags...',
		noSuggestions: '(Type a comma to create a new tag)',
		template: // you can add more markup, change tag names, or add css classes, but all the sugg-* classes need to remain
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
			// This is the original text input given
			this.$originalInput = $($textInput);
			if (this.$originalInput.length == 0) {
				// no input found
				return this;
			}
			// our options are default options plus given options
			this.options = $.extend({}, $.Suggester.defaultOptions, options);
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
			this.customHiddenName = this.options.customHiddenName || this.hiddenName + '_custom';
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
			this._publish('Initialize');
			return this;
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
			this.$widget = $(this.options.template);
			// BeforeRender callbacks now have the ability to modify this.$widget or any of its child elements
			this._publish('BeforeRender');
			// the container that tags and the input box are in
			this.$box = this.$widget.find('.sugg-box');
			// the template for tags
			this.$tagTemplate = this.$box.find('.sugg-tag').remove();
			// the text input used to type tags
			this.$input = this.$box.find('.sugg-input');
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
			// AfterRender callbacks now have access to the completed widget through this.$widget, this.$box, etc.
			this._publish('AfterRender');
		},
		/**
		 * Set up event handlers
		 * @return {undefined}
		 */
		_setupListeners: function() {
			var sugg = this;
			// proxy our unfocus and removeFocused methods so we can bind and unbind to $(document)
			this.unfocus = $.proxy(this, 'unfocus');
			this.removeFocused = $.proxy(this, 'removeFocused');
			// remove tags when `X` is clicked
			this.$box.delegate('.sugg-remove', 'click', function(evt) {
				//sugg.unfocus();
				evt.preventDefault();
				evt.stopImmediatePropagation();
				var label = $(this).parents('.sugg-tag').attr('data-label');
				sugg.removeLabel(label);
			});
			// focus tags when clicked
			this.$box.delegate('.sugg-tag', 'click', function(evt) {	
				// we have to stop propagation to $box click and to $document
				evt.stopImmediatePropagation();
				sugg.focus($(this));	
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
				sugg.$input.val('')[0].focus();
			});
			// focus to text input field when a click comes outside of any tags
			this.$box.click(function(evt) {
				if (evt.target == sugg.$box[0]) {
					sugg.unfocus();
					sugg.$input[0].focus();
				}
			});
			this.$input.keydown($.proxy(this, '_keydown'))
		},
		/**
		 * Focus on a previously added tag
		 * @params {jQuery} $tag  The .sugg-tag element to focus
		 * @return $.Suggester
		 */
		focus: function($tag) {
			this.unfocus();
			this.$focusedTag = $tag.addClass('sugg-focused');
			// remove tag if user presses delete or backspace
			$document.keydown(this.removeFocused).click(this.unfocus);
			return this;
		},
		/**
		 * Unfocus the previously focussed tag
		 * @return $.Suggester
		 */
		unfocus: function() {
			$document.unbind('keydown', this.removeFocused).unbind('click', this.unfocus);
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
		removeFocused: function(evt) {
			if (evt && evt.which && (evt.which == 8 || evt.which == 46)) {
				// delete or backspace key								
				if (this.$focusedTag) {
					this.removeLabel(this.$focusedTag.attr('data-label'));
				}
				evt.preventDefault();
			}	
			this.unfocus();
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
					this.unfocus();
					// move selection up in suggestion box
					this.moveSelection('up');
					return;
				case 40: // down
					evt.preventDefault();
					// unfocus any focused tags
					this.unfocus();
					// move selection down in suggestion box
					this.moveSelection('down');
					return;
				case 8: // backspace
					this.$currentItem = null;
					// TODO: check for first position, not for value == '' ?
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
			// clear timeout from key delay
			clearTimeout(this.timeoutHandle);
			this.$currentItem = null;
			this.unfocus();
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
		/**
		 * Fetch suggestions from an ajax URL
		 */
		fetchResults: function(query) {
			
		},
		/**
		 * Move the selection up or down in the suggestion box
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
			if (evt.isDefaultPrevented()) {
				return this;
			}
			if (this.$currentItem) {
				this.deselectItem(this.$currentItem);
			}
			if ($nextItem) {
				this.selectItem($nextItem);
			}
			var $lastItem = this.currentItem;
			this.$currentItem = $nextItem;
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
		 */
		closeSuggestBox: function() {
			$document.unbind('click.sugg');
			this.$suggList.hide();
			return this;
		},
//		focus: function() {
//			this.$input[0].focus();
//			return this;
//		},
		get: function(prop) {
			return this[prop];
		},
		set: function(prop, value) {
			this[prop] = value;
			return this;
		},
		/**
		 * Format a suggestion before display
		 * @param {Object} record  The record that was suggested
		 * @param {String} substr  The string that generated the list of suggestions
		 * @return {String}  HTML to use as the item (e.g. '<li class="sugg-item">Suggestion</li>')
		 */
		_formatSuggestion: function(record, substr) {
			var options = this.options;
			var label = record[options.labelProperty];
			// handle case insensitive replacements
			var replacer = this.options.caseSensitive ? substr : new RegExp('(' + substr + ')', 'i');
			var replacee = this.options.caseSensitive ? substr : '$1';
			// allow replacements of all {record.field} matches in this.listItemTemplate
			label = this.listItemTemplate.replace(/\{record\.(.+?)\}/g, function($0, $1) {
				var replacement = record[$1];
				if (typeof replacement == 'string' || !!replacement) {
					if ($1 == options.labelProperty) {						
						replacement = replacement.replace(replacer, '<strong class="sugg-match">' + replacee + '</strong>');
					}
					return replacement;
				}
				return '';
			});		
			return label;
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
				$.each(sugg.options.searchProperties, function() {
					var value = '' + (item[this] || '');
					if (!sugg.options.caseSensitive) {
						value = value.toLowerCase();
					}
					if (
						(sugg.options.matchAnywhere && value.indexOf(evt.text) > -1) 
						|| (!sugg.options.matchAnywhere && value.indexOf(evt.text) == 0) 
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
			if (this.options.preventDuplicates && label in this.customHiddens) {
				return false;
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
			if (this.options.preventDuplicates && id in this.hiddens) {
				return false;
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
//			if (options.defaultMethod || !evt.isDefaultPrevented()) {
//				this[options.defaultMethod].apply(this, evt.args || []);
//			}
			
			
//			var pubsub = $(this);
//			var suggester = this;
//			$.each(['bind','unbind','trigger','triggerHandler','on','off','one'], function(i, name) {
//				suggester[name] = function() {
//					return pubsub[name].apply(pubsub, slice.call(arguments));
//				};
//			});
						
		},
		getInstance: function() {
			return this;
		}	
	};
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
	
	
	
	
	
	
	
	
	
	
//	$.fn.autoSuggest = function(data, options) {
//		var defaults = { 
//			asHtmlID: false,
//			startText: "Enter Name Here",
//			emptyText: "No Results Found",
//			preFill: {},
//			limitText: "No More Selections Are Allowed",
//			selectedItemProp: "value", //name of object property
//			selectedValuesProp: "value", //name of object property
//			searchObjProps: "value", //comma separated list of object property names
//			queryParam: "q",
//			retrieveLimit: false, //number for 'limit' param on ajax request
//			extraParams: "",
//			matchCase: false,
//			minChars: 1,
//			keyDelay: 400,
//			resultsHighlight: true,
//			neverSubmit: false,
//			selectionLimit: false,
//			showResultList: true,
//		  	start: function(){},
//		  	selectionClick: function(elem){},
//		  	selectionAdded: function(elem){},
//		  	selectionRemoved: function(elem){ elem.remove(); },
//		  	formatList: false, //callback function
//		  	beforeRetrieve: function(string){ return string; },
//		  	retrieveComplete: function(data){ return data; },
//		  	resultClick: function(data){},
//		  	resultsComplete: function(){}
//	  	};  
	 	/*this.opts = $.extend(defaults, options);	 	
		
		var d_type = "object";
		var d_count = 0;
		if(typeof data == "string") {
			d_type = "string";
			var req_string = data;
		} else {
			var org_data = data;
			for (k in data) if (data.hasOwnProperty(k)) d_count++;
		}
		if((d_type == "object" && d_count > 0) || d_type == "string"){
			return this.each(function(x){
				if(!this.opts.asHtmlID){
					x = x+""+Math.floor(Math.random()*100); //this ensures there will be unique IDs on the page if autoSuggest() is called multiple times
					var x_id = "as-input-"+x;
				} else {
					x = this.opts.asHtmlID;
					var x_id = x;
				}
				this.opts.start.call(this);
				var input = $(this);
				input.attr("autocomplete","off").addClass("as-input").attr("id",x_id).val(this.opts.startText);
				var input_focus = false;
				
				// Setup basic elements and render them to the DOM
				input.wrap('<ul class="as-selections" id="as-selections-'+x+'"></ul>').wrap('<li class="as-original" id="as-original-'+x+'"></li>');
				var selections_holder = $("#as-selections-"+x);
				var org_li = $("#as-original-"+x);				
				var results_holder = $('<div class="as-results" id="as-results-'+x+'"></div>').hide();
				var results_ul =  $('<ul class="as-list"></ul>');
				var values_input = $('<input type="hidden" class="as-values" name="as_values_'+x+'" id="as-values-'+x+'" />');
				var prefill_value = "";
				if(typeof this.opts.preFill == "string"){
					var vals = this.opts.preFill.split(",");					
					for(var i=0; i < vals.length; i++){
						var v_data = {};
						v_data[this.opts.selectedValuesProp] = vals[i];
						if(vals[i] != ""){
							add_selected_item(v_data, "000"+i);	
						}		
					}
					prefill_value = this.opts.preFill;
				} else {
					prefill_value = "";
					var prefill_count = 0;
					for (k in this.opts.preFill) if (this.opts.preFill.hasOwnProperty(k)) prefill_count++;
					if(prefill_count > 0){
						for(var i=0; i < prefill_count; i++){
							var new_v = this.opts.preFill[i][this.opts.selectedValuesProp];
							if(new_v == undefined){ new_v = ""; }
							prefill_value = prefill_value+new_v+",";
							if(new_v != ""){
								add_selected_item(this.opts.preFill[i], "000"+i);	
							}		
						}
					}
				}
				if(prefill_value != ""){
					input.val("");
					var lastChar = prefill_value.substring(prefill_value.length-1);
					if(lastChar != ","){ prefill_value = prefill_value+","; }
					values_input.val(","+prefill_value);
					$("li.as-selection-item", selections_holder).addClass("blur").removeClass("selected");
				}
				input.after(values_input);
				selections_holder.click(function(){
					input_focus = true;
					input.focus();
				}).mousedown(function(){ input_focus = false; }).after(results_holder);	

				var timeout = null;
				var prev = "";
				var totalSelections = 0;
				var tab_press = false;
				
				// Handle input field events
				input.focus(function(){			
					if($(this).val() == this.opts.startText && values_input.val() == ""){
						$(this).val("");
					} else if(input_focus){
						$("li.as-selection-item", selections_holder).removeClass("blur");
						if($(this).val() != ""){
							results_ul.css("width",selections_holder.outerWidth());
							results_holder.show();
						}
					}
					input_focus = true;
					return true;
				}).blur(function(){
					if($(this).val() == "" && values_input.val() == "" && prefill_value == ""){
						$(this).val(this.opts.startText);
					} else if(input_focus){
						$("li.as-selection-item", selections_holder).addClass("blur").removeClass("selected");
						results_holder.hide();
					}				
				}).keydown(function(e) {
					// track last key pressed
					lastKeyPressCode = e.keyCode;
					first_focus = false;
					switch(e.keyCode) {
						case 38: // up
							e.preventDefault();
							moveSelection("up");
							break;
						case 40: // down
							e.preventDefault();
							moveSelection("down");
							break;
						case 8:  // delete
							if(input.val() == ""){							
								var last = values_input.val().split(",");
								last = last[last.length - 2];
								selections_holder.children().not(org_li.prev()).removeClass("selected");
								if(org_li.prev().hasClass("selected")){
									values_input.val(values_input.val().replace(","+last+",",","));
									this.opts.selectionRemoved.call(this, org_li.prev());
								} else {
									this.opts.selectionClick.call(this, org_li.prev());
									org_li.prev().addClass("selected");		
								}
							}
							if(input.val().length == 1){
								results_holder.hide();
								 prev = "";
							}
							if($(":visible",results_holder).length > 0){
								if (timeout){ clearTimeout(timeout); }
								timeout = setTimeout(function(){ keyChange(); }, this.opts.keyDelay);
							}
							break;
						case 9: case 188:  // tab or comma
							tab_press = true;
							var i_input = input.val().replace(/(,)/g, "");
							if(i_input != "" && values_input.val().search(","+i_input+",") < 0 && i_input.length >= this.opts.minChars){	
								e.preventDefault();
								var n_data = {};
								n_data[this.opts.selectedItemProp] = i_input;
								n_data[this.opts.selectedValuesProp] = i_input;																				
								var lis = $("li", selections_holder).length;
								add_selected_item(n_data, "00"+(lis+1));
								input.val("");
							}
						case 13: // return
							tab_press = false;
							var active = $("li.active:first", results_holder);
							if(active.length > 0){
								active.click();
								results_holder.hide();
							}
							if(this.opts.neverSubmit || active.length > 0){
								e.preventDefault();
							}
							break;
						default:
							if(this.opts.showResultList){
								if(this.opts.selectionLimit && $("li.as-selection-item", selections_holder).length >= this.opts.selectionLimit){
									results_ul.html('<li class="as-message">'+this.opts.limitText+'</li>');
									results_holder.show();
								} else {
									if (timeout){ clearTimeout(timeout); }
									timeout = setTimeout(function(){ keyChange(); }, this.opts.keyDelay);
								}
							}
							break;
					}
				});
				
				function keyChange() {
					// ignore if the following keys are pressed: [del] [shift] [capslock]
					if( lastKeyPressCode == 46 || (lastKeyPressCode > 8 && lastKeyPressCode < 32) ){ return results_holder.hide(); }
					var string = input.val().replace(/[\\]+|[\/]+/g,"");
					if (string == prev) return;
					prev = string;
					if (string.length >= this.opts.minChars) {
						selections_holder.addClass("loading");
						if(d_type == "string"){
							var limit = "";
							if(this.opts.retrieveLimit){
								limit = "&limit="+encodeURIComponent(this.opts.retrieveLimit);
							}
							if(this.opts.beforeRetrieve){
								string = this.opts.beforeRetrieve.call(this, string);
							}
							$.getJSON(req_string+"?"+this.opts.queryParam+"="+encodeURIComponent(string)+limit+this.opts.extraParams, function(data){ 
								d_count = 0;
								var new_data = this.opts.retrieveComplete.call(this, data);
								for (k in new_data) if (new_data.hasOwnProperty(k)) d_count++;
								processData(new_data, string); 
							});
						} else {
							if(this.opts.beforeRetrieve){
								string = this.opts.beforeRetrieve.call(this, string);
							}
							processData(org_data, string);
						}
					} else {
						selections_holder.removeClass("loading");
						results_holder.hide();
					}
				}
				var num_count = 0;
				function processData(data, query){
					if (!this.opts.matchCase){ query = query.toLowerCase(); }
					var matchCount = 0;
					results_holder.html(results_ul.html("")).hide();
					for(var i=0;i<d_count;i++){				
						var num = i;
						num_count++;
						var forward = false;
						if(this.opts.searchObjProps == "value") {
							var str = data[num].value;
						} else {	
							var str = "";
							var names = this.opts.searchObjProps.split(",");
							for(var y=0;y<names.length;y++){
								var name = $.trim(names[y]);
								str = str+data[num][name]+" ";
							}
						}
						if(str){
							if (!this.opts.matchCase){ str = str.toLowerCase(); }				
							if(str.search(query) != -1 && values_input.val().search(","+data[num][this.opts.selectedValuesProp]+",") == -1){
								forward = true;
							}	
						}
						if(forward){
							var formatted = $('<li class="as-result-item" id="as-result-item-'+num+'"></li>').click(function(){
									var raw_data = $(this).data("data");
									var number = raw_data.num;
									if($("#as-selection-"+number, selections_holder).length <= 0 && !tab_press){
										var data = raw_data.attributes;
										input.val("").focus();
										prev = "";
										add_selected_item(data, number);
										this.opts.resultClick.call(this, raw_data);
										results_holder.hide();
									}
									tab_press = false;
								}).mousedown(function(){ input_focus = false; }).mouseover(function(){
									$("li", results_ul).removeClass("active");
									$(this).addClass("active");
								}).data("data",{attributes: data[num], num: num_count});
							var this_data = $.extend({},data[num]);
							if (!this.opts.matchCase){ 
								var regx = new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + query + ")(?![^<>]*>)(?![^&;]+;)", "gi");
							} else {
								var regx = new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + query + ")(?![^<>]*>)(?![^&;]+;)", "g");
							}
							
							if(this.opts.resultsHighlight){
								this_data[this.opts.selectedItemProp] = this_data[this.opts.selectedItemProp].replace(regx,"<em>$1</em>");
							}
							if(!this.opts.formatList){
								formatted = formatted.html(this_data[this.opts.selectedItemProp]);
							} else {
								formatted = this.opts.formatList.call(this, this_data, formatted);	
							}
							results_ul.append(formatted);
							delete this_data;
							matchCount++;
							if(this.opts.retrieveLimit && this.opts.retrieveLimit == matchCount ){ break; }
						}
					}
					selections_holder.removeClass("loading");
					if(matchCount <= 0){
						results_ul.html('<li class="as-message">'+this.opts.emptyText+'</li>');
					}
					results_ul.css("width", selections_holder.outerWidth());
					results_holder.show();
					this.opts.resultsComplete.call(this);
				}
				
				function add_selected_item(data, num){
					values_input.val(values_input.val()+data[this.opts.selectedValuesProp]+",");
					var item = $('<li class="as-selection-item" id="as-selection-'+num+'"></li>').click(function(){
							this.opts.selectionClick.call(this, $(this));
							selections_holder.children().removeClass("selected");
							$(this).addClass("selected");
						}).mousedown(function(){ input_focus = false; });
					var close = $('<a class="as-close">&times;</a>').click(function(){
							values_input.val(values_input.val().replace(","+data[this.opts.selectedValuesProp]+",",","));
							this.opts.selectionRemoved.call(this, item);
							input_focus = true;
							input.focus();
							return false;
						});
					org_li.before(item.html(data[this.opts.selectedItemProp]).prepend(close));
					this.opts.selectionAdded.call(this, org_li.prev());	
				}
				
				function moveSelection(direction){
					if($(":visible",results_holder).length > 0){
						var lis = $("li", results_holder);
						if(direction == "down"){
							var start = lis.eq(0);
						} else {
							var start = lis.filter(":last");
						}					
						var active = $("li.active:first", results_holder);
						if(active.length > 0){
							if(direction == "down"){
							start = active.next();
							} else {
								start = active.prev();
							}	
						}
						lis.removeClass("active");
						start.addClass("active");
					}
				}
									
			});
		}*/
 	
