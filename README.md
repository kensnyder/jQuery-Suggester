Suggester for jQuery 
=

Version 1.0, December 2012

[Demos](http://sandbox.kendsnyder.com/suggester/demo/demo.html)

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
* Fully unit tested - [Unit tests](http://sandbox.kendsnyder.com/suggester/demo/unit-tests.html) 
* Works on IE8+, FF, Chrome, Safari

How to Use
-

Suggester is compatible with jQuery 1.5 and has been tested with jQuery 1.8. Add the following HTML to your &lt;head&gt;:

```html
<script src="./assets/js/jquery.js"></script>
<script src="/jquery.suggester.js"></script>
<link rel="stylesheet" href="../jquery.suggester.css" />
```

Then somewhere in your code, call:

```javascript
$(input).suggester(options);
// OR
var instance = new $.Suggester(input, options);
```

See the documentation below for a full list of options.

Example Usage
-

```javascript
$('.my-text-input').suggester({
    data: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    prompt: 'Enter a day of the week'
});
$('.my-text-input').suggester({
    dataUrl: 'http://example.com/myjson?query=%s',
    prompt: 'Enter a time zone'
});
var suggester = new $.Suggester('.my-text-input', {
	data: [{"label":"John Doe","value":"John Doe <John.Doe@example.com>"}/*,...*/],
    onAfterSave: function(event) {
        saveToServer(event.newValue);
    }
});
suggester.bind('AfterClose', doStuff);
suggester.focus();
```

Options Documentation
-

* {Array} **data** (default=`false`) - An array of suggestion strings or objects. Examples:
  * `["Dell","HP","Apple","Samsung","Acer"]`
  * `[{"value":"Dell"},{"value":"HP"},{"value":"Apple"},{"value":"Samsung"},{"value":"Acer"}]`
  * `[{"value":"Dell","founded":1984},{"value":"HP","founded":1939},...]`
  * (Leave empty to use an ajax data source)
* {String} **valueProperty** (default=`"value"`) - The property in `data` to write back to the original input
* {String} **labelProperty** (default=`"value"`) - The property to show for a chosen item
* {Array} **searchProperties** (default=`["value"]`) - A list of properties in `data` to search for suggestions
* {String|Number} **matchAt** (default=`"anywhere"`) - Where to match within the `searchProperties` strings:
  * `"anywhere"` - Suggest items that contain the input text
  * `"start"` - Suggest items that begin with the input text
  * `"end"` - Suggest items that end with the input text
  * `0` - Suggest items that begin with the input text
  * `3` - Suggest items that begin with the input text starting at character 3 in the item
* {Boolean} **caseSensitive** (default=`false`) - If false, find suggestion matches regardless of letter case
* {String} **dataUrl** (default=`false`) - The URL from which to get JSON or JSONP suggestions. Use a `%s` to indicate where to insert term and callback. Examples:
  * `"http://example.com/myjson?query=%s"`
  * `"http://example.com/myjsonp?query=%s&callback=%s"`
* {String} **fly** (default=`"down"`) - Which way the suggestion box should flow relative to the widget. Either `"up"` or `"down"`
* {String} **suggListPosition** (default=`"relative"`) - If `"absolute"`, overlay suggestion box relative to `document.body`. Useful for widgets used inside tables
* {Boolean} **multiselect** (default=`true`) - If true, allow multiple tags to be chosen
* {Boolean} **preventDuplicates** (default=`true`) - If true, prevent a tag from being added twice
* {Boolean} **omitAlreadyChosenItems** (default=`true`) - If true, omit already chosen items from the suggestion list
* {Number} **minChars** (default=`3`) - The minimum number of characters that must be entered before suggestions are fetched
* {Number} **keyDelay** (default=`400`) - Don't fetch suggestions until this many milliseconds between keypresses
* {Boolean} **addOnComma** (default=`true`) - If true, add new tags when comma is pressed
* {Boolean} **addOnTab** (default=`true`) - If true, add new tags when tab is pressed
* {Boolean} **submitOnEnter** (default=`false`) - If true, submit the form when enter is pressed on the empty widget
* {String} **inputSize** (default=`"auto"`) - Manually set input's `size` property. If `"auto"`, expand size as the user types
* {String} **placeholder** (default=`false`) - Placeholder text to display in the input when empty and unfocused. Behaves like an elements `placeholder` attribute
* {String} **placeholder** (default=`false`) - Placeholder text to display in the input when empty and unfocused. Behaves like an elements `placeholder` attribute
* {String} **prompt** (default=`false`) - A message to show when the input is focused but the text is below `minChars`
* {Number} **maxSuggestions** (default=`10`) - Limit results to this many suggestions
* {Boolean} **addHiddenInputs** (default=`true`) - If true, also add a hidden input for each tag (`fieldname_tag[]`) for easier server-side processing
* {Boolean} **highlightSubstring** (default=`true`) - If true, wrap first matching substring in each suggestion with `<strong class="sugg-match"></strong>`
* {String} **template** (default=*see below*) - The HTML used to generate the widget. You can add more markup, change tag names, or add css classes, but all the `sugg-*` classes need to remain
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
* {String} **listItemTemplate** (default=`false`) - Overrides the `<li class="sugg-item {record.cssClass}">{record.value}</li>` value above

Events Documentation
-

Events can be passed as options to the constructor, or can be added later using jQuery event methods `.on()`, `.off()`, `.bind()` `.once()`, `.unbind()` and `.trigger()`

For example:

```javascript
// Register events in constructor
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

* Each event callback receives one or two arguments: `event` and `data`
* `event` is a jQuery event object
* `data` is an object containing useful information related to the event. `data` is omitted if there is no useful information to pass
* When an event has a default action that can be prevented, both `event` and `data` will have property `cancellable` set to true and `event.isCancellable()` will return true
* To prevent a default action, call `event.preventDefault()`
* To cancel the firing of other attached callbacks, call `event.stopImmediatePropagation()`
* The callback will be fired in the scope of the widget instance. In other words, using `this` in the callback will refer to the widget. See the Suggester Instance Properties and Suggester Instance Methods sections below for more information.

Available Events
-

* `**onBeforeRender** - Called before the widget is rendered
* `**onInitialize** - Called after widget is initialize and rendered
* `**onBeforeHandleKey** - Called before the keydown event is handled
* ...

Suggester Instance Properties
-

* {jQuery} **$originalInput** - The input that was used to create the widget
* {Object} **options** - The options that were passed to the constructor

Suggester Instance Methods
-

Instance methods may be called using an OOP style or with the classic jQuery style:

```javascript
// OOP Style
var suggester = new $.Suggester(input, options);
suggester.methodName(arg1, arg2, argN);
// jQuery Style
$(input).suggester(options);
$(input).suggester('methodName', arg1, arg2, argN);
```

* {jQuery} **add({String} **value**[, {String} **label**][, {jQuery} **$item**]) - Add a new tag as if the user had typed it
* {jQuery} **destroy()** - Remove the widget and replace the original input. Returns the original input

Change log
-

**Version 1.0, December 2012**

*initial version*

License
-

Copyright 2012, Ken Snyder

[MIT License](http://www.opensource.org/licenses/mit-license.php)

Inspired by the AutoSuggest plugin by Drew Wilson