Suggester for jQuery 
=

Version 1.0, December 2012, MIT License

[Demos](http://sandbox.kendsnyder.com/suggester/demo/demo.html)

Table of Contents
-

<ul>
	<li><a href="#introduction">Introduction</a></li>
	<li><a href="#how-to-use">How to Use</a></li>
	<li><a href="#options">Options</a></li>
	<li><a href="#events">Events</a></li>
	<li><a href="#instance-properties">Instance Properties</a></li>
	<li><a href="#instance-methods">Instance Methods</a></li>
	<li><a href="#static-members">Static Members</a></li>
	<li><a href="#more-examples">More Examples</a></li>
	<li><a href="#changelog">Changelog</a></li>
	<li><a href="#license">License</a></li>
</ul>

Introduction
-

Turn a text input into a Gmail / Facebook-style auto-complete widget. Features include:

* Load data from a JavaScript array, object, json url, or jsonp url
* Lots of options
* Populates original input with chosen tags but also creates hidden inputs with ids and tag text
* Has methods to add a tag programmatically (e.g. user chooses a popular tag)
* CSS is easy to extend and customize
* CSS uses em units so that you can easily size the widget however you like
* You can subscribe to any of 20+ events that allow you to inject custom functionality into nearly every action
* You can define your own HTML structure for the widget output
* Object-oriented structure makes it easy to extend
* 5kb minimized and gzipped
* Unit tested - [Unit tests](http://sandbox.kendsnyder.com/suggester/demo/unit-tests.html) 
* Works on IE8+, FF, Chrome, Safari


How to Use
-

Suggester is compatible with jQuery 1.5 and has been tested with jQuery 1.8. Copy or git checkout the Suggester files to your scripts directory then add the following HTML to your &lt;head&gt;:

```html
<script src="/assets/js/jquery.js"></script>
<script src="/assets/js/suggester/jquery.suggester.min.js"></script>
<link href="/assets/js/suggester/jquery.suggester.css" rel="stylesheet" />
```

Then somewhere in your code, call:

```javascript
$(input).suggester(options);
// OR
var instance = new $.Suggester(input, options);
```

See the documentation below for a full list of options.

Options
-

<table>
	<tr>
		<th>Type</th>
		<th>Option Name</th>
		<th>Default</th>
		<th>Description</th>
	<tr>
	<tr>
		<td>{Array}</td>
		<td><strong>data</strong></td>
		<td>false</td>
		<td>An array of suggestion strings or objects. Examples:<br />
			<ul>
				<li><code>["Dell","HP","Apple"]</code></li>
				<li><code>[{"value":"Dell"},{"value":"HP"},{"value":"Apple"}]</code></li>
				<li><code>[{"value":"Dell","founded":1984},{"value":"HP","founded":1939},...]</code></li>
				<li>(Leave empty to use an ajax data source)</li>
			</ul>
		</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>valueProperty</strong></td>
		<td>"value"</td>
		<td>The property in <code>data</code> to write back to the original input</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>labelProperty</strong></td>
		<td>"value"</td>
		<td>The property to show for a chosen item</td>
	</tr>
	<tr>
		<td>{Array}</td>
		<td><strong>searchProperties</strong></td>
		<td>["value"]</td>
		<td>A list of properties in <code>data</code> to search for suggestions</td>
	</tr>
	<tr>
		<td>{String}<br />OR<br />{Number}</td>
		<td><strong>matchAt</strong></td>
		<td>"anywhere"</td>
		<td>Where to match within the <code>searchProperties</code> strings<br />
			<ul>
				<li><code>"anywhere"</code> - Suggest items that contain the input text</li>
				<li><code>"start"</code> - Suggest items that begin with the input text</li>
				<li><code>"end"</code> - Suggest items that end with the input text</li>
				<li><code>0</code> - Suggest items that begin with the input text</li>
				<li><code>3</code> - Suggest items that begin with the input text starting at character 3 in the item</li>
			</ul>
		</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>caseSensitive</strong></td>
		<td>false</td>
		<td>If false, find suggestion matches regardless of letter case</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>dataUrl</strong></td>
		<td>false</td>
		<td>The URL from which to get JSON or JSONP suggestions. Use a <code>%s</code> to indicate where to insert term and callback. Examples:<br />
			<ul>
				<li><code>"http://example.com/myjson?query=%s"</code>
				<li><code>"http://example.com/myjsonp?query=%s&callback=%s"</code></li>
			</ul>
		</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>dataType</strong></td>
		<td>"json"</td>
		<td>If <code>"jsonp"</code> use JSONP to fetch results instead of JSON</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>fly</strong></td>
		<td>"down"</td>
		<td>Which way the suggestion box should flow relative to the widget. Either <code>"up"</code> or <code>"down"</code></td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>suggListPosition</strong></td>
		<td>"relative"</td>
		<td>If <code>"absolute"</code>, overlay suggestion box relative to <code>document.body</code>. Useful for widgets used inside tables</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>multiselect</strong></td>
		<td>true</td>
		<td>If true, allow multiple tags to be chosen</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>preventDuplicates</strong></td>
		<td>true</td>
		<td>If true, prevent a tag from being added twice</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>omitAlreadyChosenItems</strong></td>
		<td>true</td>
		<td>If true, omit already chosen items from the suggestion list</td>
	</tr>
	<tr>
		<td>{Number}</td>
		<td><strong>minChars</strong></td>
		<td>3</td>
		<td>The minimum number of characters that must be entered before suggestions are fetched</td>
	</tr>
	<tr>
		<td>{Number}</td>
		<td><strong>keyDelay</strong></td>
		<td>400</td>
		<td>Don't fetch suggestions until this many milliseconds between keypresses</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>addOnComma</strong></td>
		<td>true</td>
		<td>If true, add new tags when comma is pressed</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>addOnTab</strong></td>
		<td>true</td>
		<td>If true, add new tags when tab is pressed</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>submitOnEnter</strong></td>
		<td>false</td>
		<td>If true, submit the form when enter is pressed on the empty widget</td>
	</tr>
	<tr>
		<td>{String}<br />OR<br />{Number}</td>
		<td><strong>inputSize</strong></td>
		<td>"auto"</td>
		<td>Manually set input's <code>size</code> property. If <code>"auto"</code>, expand size as the user types</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>placeholder</strong></td>
		<td>false</td>
		<td>Placeholder text to display in the input when empty and unfocused. Behaves like an element's <code>placeholder</code> attribute</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>prompt</strong></td>
		<td>false</td>
		<td>A message to show when the input is focused but the text is below <code>minChars</code></td>
	</tr>
	<tr>
		<td>{Number}</td>
		<td><strong>maxSuggestions</strong></td>
		<td>10</td>
		<td>Limit results to this many suggestions</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>addHiddenInputs</strong></td>
		<td>true</td>
		<td>If true, also add a hidden input for each tag (<code>fieldname_tag[]</code>) for easier server-side processing</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>highlightSubstring</strong></td>
		<td><codetrue</td>
		<td>If true, wrap first matching substring in each suggestion with a <code>strong</code> tag with class <code>sugg-match</code></td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>template</strong></td>
		<td><em>see below</em></td>
		<td>The HTML used to generate the widget. You can add more markup, change tag names, or add css classes, but all the <code>sugg-*</code> classes need to remain</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>listItemTemplate</strong></td>
		<td><em>see below</em></td>
		<td>Overrides the <code>.sugg-item</code> element below</td>
	</tr>
</table>

Default value for **template** option:

```html
<div class="sugg-widget">  <!-- this.$widget -->
	<ul class="sugg-box">  <!-- this.$box -->
		<li class="sugg-box-item sugg-tag">  <!-- this.$tagTemplate -->
			<span class="sugg-label">TAG TEXT GOES HERE</span><span class="sugg-remove" title="Click to remove">&times;</span> 
		</li>  
		<li class="sugg-box-item sugg-input-wrapper">  <!-- this.$inputWrapper -->
			<input type="text" class="sugg-input" value="" />  <!-- this.$input -->
		</li> 
	</ul> 
	<div class="sugg-list-wrapper">  
		<ul class="sugg-list" style="display:none">  <!-- this.$suggList -->
			<li class="sugg-item {record.cssClass}">{record.value}</li>  <!-- innerHTML is used as this.listItemTemplate unless options.listItemTemplate is set -->
			<li class="sugg-empty"></li>  <!-- this.$empty -->
			<li class="sugg-prompt"></li>  <!-- this.$prompt -->
		</ul> 
	</div> 
</div>
```

Also note that default options can be overwritten by altering `$.Suggester.defaultOptions`.

Events
-

Events can be passed as options to the constructor, or can be added later using jQuery event methods `.on()`, `.off()`, `.bind()` `.once()`, `.unbind()` and `.trigger()`

For example:

```javascript
// Register events in initial options
$(input).suggester({
	data: myData,
	onBeforeOpen: doStuff
});
// Register events later
$(input).suggester({
	data: myData
}).suggester('bind', 'BeforeOpen', doStuff);
```

How is data passed to callbacks?

* Each event callback receives one argument: `event`
* `event` is a jQuery event object
* `event` also contains useful information related to the event. See the Available Events section below for more information.
* When an event has a default action that can be prevented, `event` will have property `cancellable` set to true and `event.isCancellable()` will return true
* To prevent a default action, call `event.preventDefault()`
* To cancel the firing of other attached callbacks, call `event.stopImmediatePropagation()`
* In some case, altering information on the `event` object will change the behavior of the default action
* The callback will be fired in the scope of the widget instance. In other words, using `this` in the callback will refer to the widget. See the Suggester Instance Properties and Suggester Instance Methods sections below for more information.

The following is a description of each event. See the Suggester Instance Methods section for event handler examples.

<table>
	<tr>
		<th>Name</th>
		<th>Description</th>
		<th>Called within Method</th>
		<th>Data available on <code>event</code></th>
		<th>Cancellable?</th>
	<tr>
	<tr>
		<td><strong>BeforeRender</strong></td>
		<td>Called before the widget is rendered</td>
		<td>_render()</td>
		<td></td>
		<td>No</td>
	</tr>
	<tr>
		<td><strong>Initialize</strong></td>
		<td>Called after widget is initialize and rendered</td>
		<td>initialize()</td>
		<td></td>
		<td>No</td>
	</tr>
	<tr>
		<td><strong>BeforeHandleKey</strong></td>
		<td>Called before the keydown event is handled</td>
		<td>_onKeydown()</td>
		<td>
			<code>keydown</code>: The browser keydown event
		</td>
		<td>Yes</td>
	</tr>
	<tr>
		<td><strong>AfterHandleKey</strong></td>
		<td>Called after the keydown event is handled</td>
		<td>_onKeydown()</td>
		<td>
			<code>keydown</code>: The browser keydown event
		</td>
		<td>No</td>
	</tr>
	<tr>
		<td><strong>BeforeAjax</strong></td>
		<td>Called before <code>$.ajax()</code> is called</td>
		<td>fetchResults()</td>
		<td>
			<code>settings</code>: The settings to send to $.ajax(). Alter this value to add or change settings.<br />
			<code>term</code>: The text term being searched for
		</td>
		<td>No</td>
	</tr>
	<tr>
		<td><strong>BeforeFetch</strong></td>
		<td>Called before ajax call is made but has access to jqXHR</td>
		<td>_beforeFetch()</td>
		<td>
			<code>jqXHR</code>: The jQuery XHR object<br />
			<code>term</code>: The text being searched for
		</td>
		<td>Yes</td>
	</tr>
	<tr>
		<td><strong>AfterFetch</strong></td>
		<td>Called after ajax call is made and has access to results</td>
		<td>_afterFetch()</td>
		<td>
			<code>jqXHR</code>: The jQuery XHR object<br />
			<code>term</code>: The text being searched for<br />
			<code>records</code>: The data returned
		</td>
		<td>Yes</td>
	</tr>
	<tr>
		<td><strong>BeforeMove</strong></td>
		<td></td>
		<td>moveSelection()</td>
		<td>
			<code>direction</code>: <br />
			<code>current</code>: <br />
			<code>next</code>: 
		</td>
		<td>Yes	</td>
	</tr>
	<tr>
		<td><strong></strong></td>
		<td></td>
		<td>()</td>
		<td>
			<code></code>: <br />
			<code></code>: 
		</td>
		<td>No</td>
	</tr>
</table>
			
Instance Properties
-

<table>
	<tr>
		<th>Type</th>
		<th>Name</th>
		<th>Description</th>
	<tr>
	<tr>
		<td>{jQuery}</td>
		<td><strong>$originalInput</strong></td>
		<td>Called before the widget is rendered</td>
	</tr>
	<tr>
		<td>{Object}</td>
		<td><strong>options</strong></td>
		<td>The options that were passed to the constructor</td>
	</tr>
	<tr>
		<td>{}</td>
		<td><strong></strong></td>
		<td></td>
	</tr>
</table>

Instance Methods
-

Instance methods may be called using an Object Oriented style or with the classic jQuery style:

```javascript
// Object Oriented Style
var suggester = new $.Suggester(input, options);
suggester.methodName(arg1, arg2, argN);
// jQuery Style
$(input).suggester(options);
$(input).suggester('methodName', arg1, arg2, argN);
// jQuery Style followed by Object Oriented Style
$(input).suggester(options);
var instance = $(input).suggester('getInstance');
instance.methodName(arg1, arg2, argN);
```

Source code documentation with function bodies omitted:

```javascript
$.Suggester.prototype = {
	/**
	 * @param {String|HTMLElement|jQuery} $textInput  The text input as a jQuery object, DOM element, or selector string
	 * @param {Object} options  An object with data and options (See $.Suggester.defaultOptions for explaination of options)
	 * @return {jQuery.Suggester}
	 * @event Initialize - Called after widget is initialized and rendered
	 */
	initialize: function($textInput, options) {},
	/**
	 * Completely remove Suggester widget and replace with original input box (with values populated)
	 */
	destroy: function() {},
	/**
	* Add a tag by a record
	* @param {String} value  the tag to add
	* @param {String} label  the text to display in the new tag
	* @param {jQuery} $item  Set when the record is added by choosing from the suggestion box
	* @return {jQuery} The jQuery object containing the newly created label
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
	* @event BeforeAdd - Allows you to prevent it being added or alter the record before adding
	*     event.record  The record to be added
	*     event.item    The suggestion that was chosen (if any)
	*     example       instance.bind('AfterAdd', function(event) {
	*                        // fade in tag
	*                        event.tag.fadeIn(500);
	*                   });
	*/
   add: function(value, label/*optional*/, $item/*optional*/) {},
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
   moveSelection: function(direction) {},
   /**
	* Select a suggestion
	* @param {jQuery} $tag
	* @return {jQuery.Suggester}
	*/
   selectItem: function($tag) {},
   /**
	* Deselect a suggestion
	* @param {jQuery} $tag
	* @return {jQuery.Suggester}
	*/		
   deselectItem: function($tag) {},
   /**
	* Deselect all suggestions
	* @return {jQuery.Suggester}
	*/			
   deselectAllItems: function() {},
   /**
	* Open suggestion list for the given text
	* @param {String} text
	* @return {jQuery.Suggester}
	*/
   suggest: function(text) {},
   /**
	* Add more data records to the autosuggest list. Does not apply when dataUrl is set
	* 
	* @params {Object[]} data  More records in the same object format as initially set
	* @return {jQuery.Suggester}
	*/
   addData: function(data) {},
   /**
	* Set data records to the autosuggest list. Does not apply when dataUrl is set
	* 
	* @params {Object[]} data
	* @return {jQuery.Suggester}
	*/		
   setData: function(data) {},
   /**
	* Get all the records in the autosuggest list. Does not apply when dataUrl is set
	* 
	* @return {Object[]}
	*/		
   getData: function() {},
   /**
	* Set the direction of the suggestion menu, to fly upwards or downwards
	* 
	* @param {String} direction  either "up" or "down"
	* @return {jQuery.Suggester}
	*/
   setFlyDirection: function(direction) {},
   /**
	* Focus on a previously added tag
	* @params {jQuery} $tag  The .sugg-tag element to focus
	* @return {jQuery.Suggester}
	*/
   focusTag: function($tag) {},
   /**
	* Unfocus the previously focussed tag
	* @return {jQuery.Suggester}
	*/
   unfocusTag: function() {},
   /**
	* Remove the focused tag
	* @param {jQuery.Event} evt (optional)  Used to check if $document keypress is backspace or delete
	* @return {jQuery.Suggester}
	*/
   removeFocusedTag: function(evt) {},
   /**
	* Remove a tag given its text or jQuery element or HTML element
	* @param {String|jQuery|HTMLElement} $tag  the tag to remove
	* @return {jQuery.Suggester}
	*/
   remove: function($tag) {},
   /**
	* Find a suggestion record by text
	* 
	* @param {String} text
	* @return {Object}
	*/		
   findRecord: function(text) {},		
   /**
	* Initiate suggestion process if the input text is >= this.options.minChars
	* Otherwise show prompt
	* 
	* @return {jQuery.Suggester}
	*/
   suggestIfNeeded: function() {},
   /**
	* Show the prompt text to give a hint to users
	* Only called when there are no items and this.options.prompt is truthy
	* 
	* @return {jQuery.Suggester}
	*/
   showPrompt: function() {},
   /**
	* Show text indicating there are no suggestions
	* Text is defined in this.options.emptyText
	* 
	* @return {jQuery.Suggester}
	*/		
   showEmptyText: function() {},
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
   fetchResults: function(text) {},
   /**
	* Cancel the XHR. Used when user starts typing again before XHR completes
	* 
	* @return {jQuery.Suggester}
	*/
   abortFetch: function() {},
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
   handleSuggestions: function(records) {},
   /**
	* Return true if suggestion box is open
	* @return {Boolean}
	*/
   isSuggestBoxOpen: function() {},
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
	*					this.$suggList.css({
	*						borderTopWidth: '10px',
	*						borderTopColor: 'red'
	*					});
	*                  alert('Tip: You may choose an item from the suggestion list.');
	*                  this.$suggList.css({
	*						borderTopWidth: '0'
	*					});
	*              });
	*/
   openSuggestBox: function() {},
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
   closeSuggestBox: function() {},
   /**
	* Focus cursor on text input box
	*/
   focus: function() {},
   /**
	* Get suggestion result records given some text (local data)
	* @param {String} text
	* @return {Array}  Array of Objects of matching records 
	*/
   getResults: function(text) {},
   /**
	* Publish the given event name and send the given data
	* 
	* @param {String} type  The name of the event to publish
	* @param {Object} data  Additional data to attach to the event object
	* @return {jQuery.Event}  The event object which behaves much like a DOM event object
	*/
   publish: function(type, data) {},
   /**
	* Get this instance. Useful for jQuery-ish usage:  var instance = $('input').suggester(options).suggester('getInstance')
	*/
   getInstance: function() {
	   return this;
   },
   /**
	* Set the value of the original input to a comma-delimited set of labels
	* @return {jQuery.Suggester}
	* @event  BeforeSave  (if cancelled, original imput will not be populated with new value)
	*     example  instance.bind('BeforeSave', function(event) {
	*                  event.newValue += '!';
	*              });
	* @event  AfterSave
	*     example  instance.bind('AfterSave', function(event) {
	*                  saveToServer(event.newValue);
	*              });
	*      
	*/
   save: function() {},
	/**
	 * Find a tag given value
	 * 
	 * @param {String} value      The text of the tag
	 * @return {Number}  The index position of the tag in the internal collection or -1 if not found
	 */
	getTagIndex: function(value) {}
};	
```

Static Members
-

```javascript
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
$.Suggester.addData = function(data) {};
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
 *	           options = options || {};
 *             this.options.myOption = options.myOptions || 'default';
 *             this.callParent('initialize', $textInput, options);
 *         }
 *     });
 */
$.Suggester.subclass = function(jQueryMethodName, properties) {};
```

More examples
-

Use an array of strings for suggestions:

```javascript
$('.my-text-input').suggester({
    data: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    prompt: 'Enter a day of the week'
});
```

Use ajax to get suggestions:

```javascript
$('.my-text-input').suggester({
    dataUrl: 'http://example.com/myjson?query=%s',
    prompt: 'Enter a time zone'
});
```

Use the OOP pattern and use an array of objects for `data`:

```javascript
var suggester = new $.Suggester('.my-text-input', {
	data: [{"label":"John Doe","value":"John Doe <John.Doe@example.com>"}/*,...*/],
    onAfterSave: function(event) {
        saveToServer(event.newValue);
    }
});
suggester.bind('AfterClose', doStuff);
suggester.focus();
```

See the source on the [live demos](http://sandbox.kendsnyder.com/suggester/demo/demo.html) for lots more examples.

Changelog
-

**Version 1.0, December 2012**

*initial version*

License
-

Copyright 2012, Ken Snyder

[MIT License](http://www.opensource.org/licenses/mit-license.php)

Inspired by the AutoSuggest plugin by Drew Wilson