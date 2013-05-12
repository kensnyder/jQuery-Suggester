Suggester - A Better Autocomplete Widget
=

Version 1.1.0, May 2013, MIT License

[Demos](http://sandbox.kendsnyder.com/Suggester-1.1/demo), [Unit tests](http://sandbox.kendsnyder.com/Suggester-1.1/test/Suggester.html)

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

Turn a text input into a Facebook-style multiple-tag input. Features include:

* Load data from a JavaScript array, object, json url, or jsonp url
* Lots of options
* Populates original input with chosen tags but also creates hidden inputs with ids and tag text
* Has methods to add a tag programmatically (e.g. user chooses a popular tag)
* CSS is easy to extend and customize
* CSS uses em units so that you can easily size the widget however you like
* You can subscribe to any of 20+ events that allow you to inject custom functionality into nearly every action
* You can define your own HTML structure for the widget output
* Object-oriented structure makes it easy to extend
* Less than 6kb minimized and gzipped
* Unit tested - [Unit tests](http://sandbox.kendsnyder.com/Suggester-1.1/test/Suggester.html) 
* Works on IE8+, FF, Chrome, Safari
* Compatible with AMD


How to Use
-

Suggester is compatible with jQuery 1.5+ and has been tested with jQuery 1.9. Download the files in [jQuery-Suggester.zip](https://github.com) and copy them to your scripts directory. Include them in your document's after jQuery is included:

```html
<script src="/js/Suggester.min.js"></script>
<link  href="/js/Suggester.min.css" rel="stylesheet" />
```

Then somewhere in your code, call:

```javascript
var instance = new $.Suggester(selector, options);
// OR
$(selector).suggester(options);
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
		<td>{Array|Boolean}</td>
		<td><strong>data</strong></td>
		<td>Initial data to use for suggestions</td>
		<td>false</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>valueProperty</strong></td>
		<td>The name of object property that should be used as the tag&#x27;s value. Only applicable when options.data is set</td>
		<td>value</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>labelProperty</strong></td>
		<td>The name of object property that should be used as the tag&#x27;s display text. Only applicable when options.data is set</td>
		<td>value</td>
	</tr>
	<tr>
		<td>{Array}</td>
		<td><strong>searchProperties</strong></td>
		<td>The array of object property names that should be searched when generating suggestions. Only applicable when options.data is set</td>
		<td>Array(&quot;value&quot;)</td>
	</tr>
	<tr>
		<td>{String|Number}</td>
		<td><strong>matchAt</strong></td>
		<td>Where to match when finding suggestions. It can be &quot;anywhere&quot;, &quot;start&quot;, &quot;end&quot; or an integer. Only applicable when options.data is set</td>
		<td>&quot;anywhere&quot;</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>caseSensitive</strong></td>
		<td>If true, find matches regardless of case. Only applicable when options.data is set. Only applicable when options.data is set</td>
		<td>false</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>dataUrl</strong></td>
		<td>Url to call to get json or jsonp results. Use %s to indicate where search text should be inserted. e.g. &quot;http://example.com/myjson?query=%s&quot; or &quot;http://example.com/myjsonp?query=%s&amp;callback=%s&quot;</td>
		<td>false</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>dataType</strong></td>
		<td>Can be &quot;json&quot; or &quot;jsonp&quot;. If json, options.dataUrl needs to be in the format &quot;http://example.com/myjsonp?query=%s&amp;mycallback=%s&quot;. To handle xml, you&#x27;ll need to register BeforeFetch and AfterFetch handlers or overwrite the fetchResults method</td>
		<td>&quot;json&quot;</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>fly</strong></td>
		<td>Which way should the suggestion box fly. If &quot;up&quot;, the suggestion box will appear before the input box in the DOM tree. A css class of &quot;sugg-fly-up&quot; or &quot;sugg-fly-down&quot; is applied to the widget element based on this value</td>
		<td>&quot;down&quot;</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>suggListPosition</strong></td>
		<td>If &quot;absolute&quot;, the suggestion box will be appended to &lt;body&gt; and positioned and sized each time it is opened. This is useful for widgets within table elements</td>
		<td>&quot;relative&quot;</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>multiselect</strong></td>
		<td>If true, allow multiple tags</td>
		<td>true</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>preventDuplicates</strong></td>
		<td>If true, the first tag will be removed when a duplicate is typed in</td>
		<td>true</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>omitAlreadyChosenItems</strong></td>
		<td>If true, don&#x27;t suggest items that have already been chosen as tags. Only applicable when options.data is set</td>
		<td>true</td>
	</tr>
	<tr>
		<td>{Number}</td>
		<td><strong>minChars</strong></td>
		<td>The minimum number of characters a user must type before the suggestion box will appear. If 0, show choices when input is simply focused (like a faux select widget)</td>
		<td>3</td>
	</tr>
	<tr>
		<td>{Number}</td>
		<td><strong>keyDelay</strong></td>
		<td>The number of milliseconds between keystrokes before the suggestion lookup begins</td>
		<td>400</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>addOnComma</strong></td>
		<td>If true, typing a comma will add the current text as a tag</td>
		<td>true</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>addOnTab</strong></td>
		<td>If true, typing a tab will add the current text as a tag</td>
		<td>true</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>addOnSemicolon</strong></td>
		<td>If true, typing a semicolon will add the current text as a tag</td>
		<td>false</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>addOnSubmit</strong></td>
		<td>If true, add tag on submit if user has entered text but not typed comma or tab</td>
		<td>true</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>addOnBlur</strong></td>
		<td>If true, add tag on blur if user has entered text but not typed comma or tab</td>
		<td>true</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>submitOnEnter</strong></td>
		<td>If false, prevent the form from submitting when the user presses enter on the empty input</td>
		<td>false</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>inputSize</strong></td>
		<td>Manually set the input size property to a certain width. If auto, set size to text width</td>
		<td>auto</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>placeholder</strong></td>
		<td>Placeholder text to display when no tags are present. e.g. &quot;Enter tags...&quot;</td>
		<td></td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>emptyText</strong></td>
		<td>Message to show when there are no suggestions - default is &quot;(Type a comma to create a new item)&quot;</td>
		<td></td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>prompt</strong></td>
		<td>Message to display in suggestion list when below min char length</td>
		<td></td>
	</tr>
	<tr>
		<td>{Number}</td>
		<td><strong>maxSuggestions</strong></td>
		<td>Only display this many suggestions</td>
		<td>10</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>addHiddenInputs</strong></td>
		<td>If true, also add a hidden input for each tag (fieldname_tag[]) for easier server-side processing (See options.hiddenName to create a custom name)</td>
		<td>true</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>hiddenName</strong></td>
		<td>The name to use for hidden elements (defaults to the original input&#x27;s name plus &quot;_tags[]&quot;)</td>
		<td></td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>highlightSubstring</strong></td>
		<td>If true, wrap first matching substring in each suggestion with &lt;strong class=&quot;sugg-match&quot;&gt;&lt;/strong&gt;</td>
		<td>true</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>template</strong></td>
		<td>The html used to generate the widget. You can add more markup, change tag names, or add css classes, but all the sugg-* classes need to remain. See below for default.
	
	&lt;div class=&quot;sugg-widget&quot;&gt; &lt;!-- this.$widget --&gt;		
		&lt;ul class=&quot;sugg-box&quot;&gt; &lt;!-- this.$box --&gt;
			&lt;li class=&quot;sugg-box-item sugg-tag&quot;&gt;  &lt;!-- this.$tagTemplate --&gt;
				&lt;span class=&quot;sugg-label&quot;&gt;TAG TEXT GOES HERE&lt;/span&gt;&lt;span class=&quot;sugg-remove&quot; title=&quot;Click to remove&quot;&gt;&amp;times;&lt;/span&gt;
			&lt;/li&gt;
			&lt;li class=&quot;sugg-box-item sugg-input-wrapper&quot;&gt; &lt;!-- this.$inputWrapper --&gt;
				&lt;input type=&quot;text&quot; class=&quot;sugg-input&quot; value=&quot;&quot; autocomplete=&quot;off&quot; /&gt; &lt;!-- this.$input --&gt;
			&lt;/li&gt;
		&lt;/ul&gt;
		&lt;div class=&quot;sugg-list-wrapper&quot;&gt;
			&lt;ul class=&quot;sugg-list&quot; style=&quot;display:none&quot;&gt; &lt;!-- this.$suggList --&gt;
				&lt;li class=&quot;sugg-item {record.cssClass}&quot;&gt;{record.value}&lt;/li&gt; &lt;!-- innerHTML is used as this.listItemTemplate unless options.listItemTemplate is set --&gt;
				&lt;li class=&quot;sugg-empty&quot;&gt;&lt;/li&gt; &lt;!-- this.$empty --&gt;
				&lt;li class=&quot;sugg-prompt&quot;&gt;&lt;/li&gt; &lt;!-- this.$prompt --&gt;
			&lt;/ul&gt;
		&lt;/div&gt;
	&lt;/div&gt;</td>
		<td></td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>listItemTemplate</strong></td>
		<td>Override the .sugg-item element in options.template</td>
		<td></td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>theme</strong></td>
		<td>The css class to add to widget (e.g. &quot;sugg-theme-coolblue&quot;). The following themes come predefined in the CSS: &quot;coolblue&quot;, &quot;faceblue&quot;, &quot;graybox&quot;, &quot;grayred&quot;</td>
		<td>&quot;coolblue&quot;</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeRender</strong></td>
		<td>See the {{#crossLink &quot;Suggester/BeforeRender:event&quot;}}BeforeRender event{{/crossLink}}</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onInitialize</strong></td>
		<td>See Suggester#initialize()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeHandleKey</strong></td>
		<td>see Suggester#_onKeydown()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterHandleKey</strong></td>
		<td>see Suggester#_onKeydown()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeAjax</strong></td>
		<td>see Suggester#fetchResults()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeFetch</strong></td>
		<td>see Suggester#_beforeFetch()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterFetch</strong></td>
		<td>see Suggester#_afterFetch()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeMove</strong></td>
		<td>see Suggester#moveSelection()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterMove</strong></td>
		<td>see Suggester#moveSelection()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeSuggest</strong></td>
		<td>see Suggester#handleSuggestions()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterSuggest</strong></td>
		<td>see Suggester#handleSuggestions()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeOpen</strong></td>
		<td>see Suggester#openSuggstBox()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterOpen</strong></td>
		<td>see Suggester#openSuggestBox()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeClose</strong></td>
		<td>see Suggester#closeSuggestBox()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterClose</strong></td>
		<td>see Suggester#closeSuggestBox()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeFormat</strong></td>
		<td>see Suggester#_formatSuggestion()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterFormat</strong></td>
		<td>see Suggester#_formatSuggestion()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeFilter</strong></td>
		<td>see Suggester#getResults()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterFilter</strong></td>
		<td>see Suggester#getResults()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeAdd</strong></td>
		<td>see Suggester#add()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterAdd</strong></td>
		<td>see Suggester#add()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeRemove</strong></td>
		<td>see Suggester#remove()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterRemove</strong></td>
		<td>see Suggester#remove()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeSave</strong></td>
		<td>see Suggester#save()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterSave</strong></td>
		<td>see Suggester#save()</td>
		<td></td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeSubmit</strong></td>
		<td>see Suggester#_onSubmit()</td>
		<td></td>
	</tr>
	
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

Events can be passed as options to the constructor, or can be added later using jQuery event methods `.on()`, `.off()`, `.bind()` `.one()`, `.unbind()` and `.trigger()`

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

How is data passed to event callbacks?

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
		<th>Data available on <code>event</code></th>
		<th>If event.preventDefault() is called</th>
	</tr>
	<tr>
		<td><strong>Initialize</strong></td>
		<td>Called after widget is initialized and rendered</td>
		<td>
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>BeforeAdd</strong></td>
		<td>Fired before a tag is added</td>
		<td>
			{String} value <em>The tag to be added</em><br />
			{String} label <em>The value of the tag to be added</em><br />
			{jQuery} item <em>The suggestion that was chosen (if any)</em><br />
			{Object} record <em>The suggestion that was chosen (if any)</em><br />
		</td>
		<td>The tag is not added</td>
	</tr>
	<tr>
		<td><strong>AfterAdd</strong></td>
		<td>Allows you to take action after a tag is added</td>
		<td>
			{jQuery} item <em>The suggestion that was chosen (if any)</em><br />
			{jQuery} tag <em>The jQuery element of the tag that was added</em><br />
			{jQuery} hidden <em>The hidden input that was generated</em><br />
			{String} value <em>The value of the tag</em><br />
			{String} label <em>The the label of the tag</em><br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>BeforeMove (if event.preventDefault() is called, movement is stopped)</strong></td>
		<td></td>
		<td>
			{String} direction <em>&quot;up&quot; or &quot;down&quot;</em><br />
			{jQuery|null} current <em>jQuery object with the currently selected item or null if there isn&#x27;t one</em><br />
			{jQuery|null} next <em>jQuery object with the item that will be selected next</em><br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>BeforeAjax - allows you to edit settings before ajax is sent!~YUIDOC_LINE~!example  instance.bind(&#x27;BeforeAjax&#x27;, function(event) );</strong></td>
		<td>Fetch suggestions from an ajax URL</td>
		<td>
			{String} text <em>The text to search for</em><br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>AfterSuggest!~YUIDOC_LINE~!    example     instance.bind(&#x27;AfterSuggest&#x27;, function(event) );</strong></td>
		<td>Take result records and build and display suggestion box</td>
		<td>
			{!~YUIDOC_LINE~!                    if (evt.text == &#x27;dont suggest&#x27;) {!~YUIDOC_LINE~!                         event.preventDefault(); // suggest box will not open!~YUIDOC_LINE~!} text <em>The text that was searched for
    example     instance.bind(&#x27;BeforeSuggest&#x27;, function(event) 
                });</em><br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>AfterOpen
    example  instance.one(&#x27;AfterOpen&#x27;, function(event) {
         this.$suggList.css({
           borderTopWidth: &#x27;10px&#x27;,
           borderTopColor: &#x27;red&#x27;
         });
                 alert(&#x27;Tip: You may choose an item from the suggestion list.&#x27;);
                 this.$suggList.css({
           borderTopWidth: &#x27;0&#x27;
         });
             });</strong></td>
		<td>Manually open the suggestion box in whatever state it is</td>
		<td>
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>AfterClose
    example  instance.bind(&#x27;AfterClose&#x27;, function(event) {
                alert(&#x27;You chose &#x27; + instance.$currentItem.text());
             });</strong></td>
		<td>Hide the suggestion list</td>
		<td>
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>BeforeRender</strong></td>
		<td>Fired after this.$widget is populated with this.options.template but before any sub elements are found</td>
		<td>
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>BeforeFetch (if event.preventDefault() is called, XHR is not made and suggest box does not open)</strong></td>
		<td>Handler for form submission</td>
		<td>
			{jQuery} jqEvent <em>The submit event</em><br />
			{} event <em>The jQuery-wrapped browser event</em><br />
			{!~YUIDOC_LINE~!                     // pretty much the same as instance.$form.submit(...)!~YUIDOC_LINE~!                     // used internally to add tag on submit if options.addOnSubmit is true!~YUIDOC_LINE~!} form <em>The input&#x27;s form (same as this.$form)
    example      instance.bind(&#x27;BeforeSubmit&#x27;, function(event) );</em><br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>BeforeFetch (if event.preventDefault() is called, XHR is not made and suggest box does not open)</strong></td>
		<td>Handler passed to $.ajax({beforeSend:...}) to alter XHR if needed</td>
		<td>
			{} jqXHR <em>the jQuery XHR object (see http://api.jquery.com/jQuery.ajax/#jqXHR)</em><br />
			{!~YUIDOC_LINE~!                     event.jqXHR.setRequestHeader(&#x27;something&#x27;,&#x27;something&#x27;);!~YUIDOC_LINE~!                     event.jqXHR.fail(function() {!~YUIDOC_LINE~!                         alert(&#x27;ajax call failed&#x27;);!~YUIDOC_LINE~!} term <em>the term that is being searched for
    example      instance.bind(&#x27;BeforeFetch&#x27;, function(event) ).always(function() {
             alert(&#x27;ajax call finished regardless of success or failure&#x27;);
                     });
                 });</em><br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>BeforeFetch (if event.preventDefault() is called, the suggest box does not open)</strong></td>
		<td>Handler passed to $.ajax().done(function(){...}) that handles suggestion data that is returned</td>
		<td>
			{} jqXHR <em>the jQuery XHR object (see http://api.jquery.com/jQuery.ajax/#jqXHR)</em><br />
			{} records <em>the object generated from the ajax returned from the XHR</em><br />
			{!~YUIDOC_LINE~!                        event.data.push({id:&#x27;&#x27;, label:&#x27;Adding a test suggestion&#x27;} term <em>the term that was search for
    example        instance.bind(&#x27;AfterFetch&#x27;, function(event) );
                   });</em><br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>AfterFormat - able to alter the html after it has be constructed</strong></td>
		<td>Format a suggestion before display</td>
		<td>
			{Object} record <em>The record that was suggested</em><br />
			{String} substr <em>The string that generated the list of suggestions</em><br />
			{} record <em>The record object that is being suggested</em><br />
			{} substr <em>The part of the string that matches the suggestion search fields</em><br />
			{!~YUIDOC_LINE~!                      event.preventDefault();!~YUIDOC_LINE~!                      event.html = &#x27;&lt;li&gt;My suggestion html&lt;/li&gt;&#x27;;!~YUIDOC_LINE~!} html <em>If you set event.html and then call event.preventDefault(), that html will be used instead of the default generated html
    example       instance.bind(&#x27;BeforeFormat&#x27;, function(event) );</em><br />
			{} record <em>The record object that is being suggested</em><br />
			{} substr <em>The part of the string that matches the suggestion search fields</em><br />
			{!~YUIDOC_LINE~!                      event.preventDefault();!~YUIDOC_LINE~!                      event.html; // &lt;li&gt;&lt;strong class=&quot;sugg-match&quot;&gt;Canis&lt;/strong&gt; Major&lt;/li&gt;!~YUIDOC_LINE~!                      event.html = event.html.replace(/&lt;\/?strong\b/, &#x27;em&#x27;),!~YUIDOC_LINE~!} html <em>Another chance to alter the html of the item after it has been generated
    example       instance.bind(&#x27;AfterFormat&#x27;, function(event) );</em><br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>AfterSave
    example  instance.bind(&#x27;AfterSave&#x27;, function(event) {
                 saveToServer(event.newValue);
             });</strong></td>
		<td>Set the value of the original input to a comma-delimited set of labels</td>
		<td>
		</td>
		<td>-</td>
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
		<td>{Object}</td>
		<td><strong>defaultOptions</strong></td>
		<td>Default options. Change these to globally change the default options
See {{#crossLink &quot;Suggester/constructor:method&quot;}}constructor{{/crossLink}} for documentation on each option</td>
	</tr>
	<tr>
		<td>Object[]</td>
		<td><strong>data</strong></td>
		<td>Array of static data used instead of an ajax call</td>
	</tr>
	<tr>
		<td>Suggester.Tag[]</td>
		<td><strong>tags</strong></td>
		<td>An array of Suggester.Tag objects</td>
	</tr>
	<tr>
		<td>String</td>
		<td><strong>hiddenName</strong></td>
		<td>The name to use for hidden elements (defaults to the original input&#x27;s name plus &quot;_tags[]&quot;)</td>
	</tr>
	<tr>
		<td>JQuery</td>
		<td><strong>$focusedTag</strong></td>
		<td>The tag that is selected for deletion</td>
	</tr>
	<tr>
		<td>JQuery</td>
		<td><strong>$currentItem</strong></td>
		<td>The item currently selected in the suggestion box</td>
	</tr>
	<tr>
		<td>JQuery</td>
		<td><strong>pubsub</strong></td>
		<td>The publish and subscribe handle - equal to $(this)</td>
	</tr>
	<tr>
		<td>JQuery</td>
		<td><strong>$widget</strong></td>
		<td>The element that wraps the widget</td>
	</tr>
	<tr>
		<td>JQuery</td>
		<td><strong>$box</strong></td>
		<td>The container that holds the chosen tags</td>
	</tr>
	<tr>
		<td>JQuery</td>
		<td><strong>$tagTemplate</strong></td>
		<td>The tag element that is cloned to make new tags</td>
	</tr>
	<tr>
		<td>JQuery</td>
		<td><strong>$input</strong></td>
		<td>The input that users type in</td>
	</tr>
	<tr>
		<td>JQuery</td>
		<td><strong>$inputWrapper</strong></td>
		<td>The container for the input</td>
	</tr>
	<tr>
		<td>JQuery</td>
		<td><strong>$suggList</strong></td>
		<td>The suggestion list element</td>
	</tr>
	<tr>
		<td>JQuery</td>
		<td><strong>$suggListWrapper</strong></td>
		<td>The element that is positioned relatively to hold the absolutely positioned suggestion list</td>
	</tr>
	<tr>
		<td>String</td>
		<td><strong>listItemTemplate</strong></td>
		<td>The html to use for suggestion list items</td>
	</tr>
	<tr>
		<td>String</td>
		<td><strong>_searchTerm</strong></td>
		<td>The search term we are currently searching for</td>
	</tr>
	<tr>
		<td>String</td>
		<td><strong>_text</strong></td>
		<td>The text in the input box that will be used to fetch results (i.e. what the user just typed)</td>
	</tr>
	<tr>
		<td>JqXHR</td>
		<td><strong>_jqXHR</strong></td>
		<td>The jQuery XHR object used initilized for fetching data - http://api.jquery.com/jQuery.ajax/#jqXHR</td>
	</tr>
	<tr>
		<td>JQuery</td>
		<td><strong>$originalInput</strong></td>
		<td>The input used to make the widget</td>
	</tr>
	<tr>
		<td>Array</td>
		<td><strong>instances</strong></td>
		<td>A collection of all the instances</td>
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

<table>

<tr>
	<td>
		{JQuery} <strong>`destroy`</strong>(options)<br />
		Completely remove Suggester widget and replace with original input box (with values populated)<br />
		{Object} `options` <br />
		Returns: {JQuery} The original input
	</td>
</tr>

<tr>
	<td>
		{JQuery} <strong>`add`</strong>(value[, label=value][, $item])<br />
		Add a tag by a record<br />
		{String} `value` the tag to add{String} [`label`=value] the text to display in the new tag{JQuery} [`$item`] Set internally when the record is added by choosing from the suggestion box<br />
		Returns: {JQuery} The jQuery object containing the newly created label or undefined if one was not created
	</td>
</tr>

<tr>
	<td>
		<strong>`addCurrentBuffer`</strong>()<br />
		Add a tag with the contents of the input; e.g. when the user has typed something but clicks on another part of the form
Note: this happens on blur when this.options.addOnBlur is true<br />
		<br />
		Returns: {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>`moveSelection`</strong>([direction=up])<br />
		Move the selection up or down in the suggestion box<br />
		{String} [`direction`=up] Either &quot;up&quot; or &quot;down&quot;<br />
		Returns: {undefined}
	</td>
</tr>

<tr>
	<td>
		{jQuery.Suggester} <strong>`selectItem`</strong>($tag)<br />
		Select a suggestion<br />
		{JQuery} `$tag` <br />
		Returns: {jQuery.Suggester} 
	</td>
</tr>

<tr>
	<td>
		{jQuery.Suggester} <strong>`deselectItem`</strong>($tag)<br />
		Deselect a suggestion<br />
		{JQuery} `$tag` <br />
		Returns: {jQuery.Suggester} 
	</td>
</tr>

<tr>
	<td>
		{jQuery.Suggester} <strong>`deselectAllItems`</strong>()<br />
		Deselect all suggestions<br />
		<br />
		Returns: {jQuery.Suggester} 
	</td>
</tr>

<tr>
	<td>
		{jQuery.Suggester} <strong>`suggest`</strong>(text)<br />
		Open suggestion list for the given text<br />
		{String} `text` <br />
		Returns: {jQuery.Suggester} 
	</td>
</tr>

<tr>
	<td>
		{jQuery.Suggester} <strong>`addData`</strong>(data)<br />
		Add more data records to the autosuggest list. Does not apply when dataUrl is set<br />
		{Object[]} `data` More records in the same object format as initially set<br />
		Returns: {jQuery.Suggester} 
	</td>
</tr>

<tr>
	<td>
		{jQuery.Suggester} <strong>`setData`</strong>(data)<br />
		Set data records to the autosuggest list. Does not apply when dataUrl is set<br />
		{Object[]} `data` <br />
		Returns: {jQuery.Suggester} 
	</td>
</tr>

<tr>
	<td>
		{Object[]} <strong>`getData`</strong>()<br />
		Get all the records in the autosuggest list. Does not apply when dataUrl is set<br />
		<br />
		Returns: {Object[]} 
	</td>
</tr>

<tr>
	<td>
		{jQuery.Suggester} <strong>`setFlyDirection`</strong>(direction)<br />
		Set the direction of the suggestion menu, to fly upwards or downwards<br />
		{String} `direction` either &quot;up&quot; or &quot;down&quot;<br />
		Returns: {jQuery.Suggester} 
	</td>
</tr>

<tr>
	<td>
		{jQuery.Suggester} <strong>`focusTag`</strong>($tag)<br />
		Focus on a previously added tag<br />
		{JQuery} `$tag` The .sugg-tag element to focus<br />
		Returns: {jQuery.Suggester} 
	</td>
</tr>

<tr>
	<td>
		{jQuery.Suggester} <strong>`unfocusTag`</strong>()<br />
		Unfocus the previously focussed tag<br />
		<br />
		Returns: {jQuery.Suggester} 
	</td>
</tr>

<tr>
	<td>
		{jQuery.Suggester} <strong>`removeFocusedTag`</strong>(evt)<br />
		Remove the focused tag<br />
		{jQuery.Event} `evt` (optional)  Used to check if $document keypress is backspace or delete<br />
		Returns: {jQuery.Suggester} 
	</td>
</tr>

<tr>
	<td>
		{jQuery.Suggester} <strong>`remove`</strong>($tag)<br />
		Remove a tag given its text or jQuery element or HTML element<br />
		{String|jQuery|HTMLElement} `$tag` the tag to remove<br />
		Returns: {jQuery.Suggester} 
	</td>
</tr>

<tr>
	<td>
		{Object} <strong>`findRecord`</strong>(text)<br />
		Find a suggestion record by text<br />
		{String} `text` <br />
		Returns: {Object} 
	</td>
</tr>

<tr>
	<td>
		{jQuery.Suggester} <strong>`suggestIfNeeded`</strong>()<br />
		Initiate suggestion process if the input text is &gt;= this.options.minChars
Otherwise show prompt<br />
		<br />
		Returns: {jQuery.Suggester} 
	</td>
</tr>

<tr>
	<td>
		{jQuery.Suggester} <strong>`showPrompt`</strong>()<br />
		Show the prompt text to give a hint to users
Only called when there are no items and this.options.prompt is truthy<br />
		<br />
		Returns: {jQuery.Suggester} 
	</td>
</tr>

<tr>
	<td>
		{jQuery.Suggester} <strong>`showEmptyText`</strong>()<br />
		Show text indicating there are no suggestions
Text is defined in this.options.emptyText<br />
		<br />
		Returns: {jQuery.Suggester} 
	</td>
</tr>

<tr>
	<td>
		{jQuery.Suggester} <strong>`abortFetch`</strong>()<br />
		Cancel the XHR. Used when user starts typing again before XHR completes<br />
		<br />
		Returns: {jQuery.Suggester} 
	</td>
</tr>

<tr>
	<td>
		{Boolean} <strong>`isSuggestBoxOpen`</strong>()<br />
		Return true if suggestion box is open<br />
		<br />
		Returns: {Boolean} 
	</td>
</tr>

<tr>
	<td>
		{jQuery.Suggester} <strong>`focus`</strong>()<br />
		Focus cursor on text input box<br />
		<br />
		Returns: {jQuery.Suggester} 
	</td>
</tr>

<tr>
	<td>
		{Array} <strong>`getResults`</strong>(text)<br />
		Get suggestion result records given some text (local data)<br />
		{String} `text` Gather suggestions based on this text<br />
		Returns: {Array} Array of Objects of matching records
	</td>
</tr>

<tr>
	<td>
		{Suggester} <strong>`clear`</strong>()<br />
		Clear all the chosen tags<br />
		<br />
		Returns: {Suggester} 
	</td>
</tr>

<tr>
	<td>
		{Array} <strong>`getTags`</strong>()<br />
		Get a collection of all the chosen tag objects<br />
		<br />
		Returns: {Array} 
	</td>
</tr>

<tr>
	<td>
		{jQuery.Suggester} <strong>`eachTag`</strong>(iterator)<br />
		Iterate through each of the chosen tag objects<br />
		{Function} `iterator` The iterator function - function(i, tag) {}<br />
		Returns: {jQuery.Suggester} 
	</td>
</tr>

<tr>
	<td>
		{String} <strong>`serialize`</strong>()<br />
		Return a URL query string representing the hidden values of the input<br />
		<br />
		Returns: {String} 
	</td>
</tr>

<tr>
	<td>
		{Array} <strong>`getValues`</strong>()<br />
		Pluck all the tag values from the chosen tags<br />
		<br />
		Returns: {Array} 
	</td>
</tr>

<tr>
	<td>
		{jQuery.Suggester} <strong>`setTheme`</strong>(themeName)<br />
		Set the widget&#x27;s CSS theme - Adds a class &quot;sugg-theme-%name%&quot; to the widget<br />
		{String} `themeName` The name of the theme to use<br />
		Returns: {jQuery.Suggester} 
	</td>
</tr>

<tr>
	<td>
		{jQuery.Suggester} <strong>`getInstance`</strong>()<br />
		Get this instance. Useful for jQuery-style usage:  var instance = $(&#x27;input&#x27;).suggester(options).suggester(&#x27;getInstance&#x27;)<br />
		<br />
		Returns: {jQuery.Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>`_processOptions`</strong>(options)<br />
		Set options and interpret options<br />
		{Object} `options` Settings passed to constructor<br />
		Returns: {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>`_render`</strong>()<br />
		Render the widget and get handles to key elements<br />
		<br />
		Returns: {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>`_handleStartValue`</strong>()<br />
		Look at the initial element&#x27;s start value and populate tags as appropriate<br />
		<br />
		Returns: {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>`_setupListeners`</strong>()<br />
		Attach event handlers<br />
		<br />
		Returns: {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>`_onInputFocus`</strong>(evt)<br />
		Event handler for when this.$input is focused<br />
		{jQuery.Event} `evt` The focus event<br />
		Returns: {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>`_onInputBlur`</strong>(evt)<br />
		Event handler for when this.$input is blurred<br />
		{jQuery.Event} `evt` blur event<br />
		Returns: {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>`_onTagRemoveClick`</strong>(evt)<br />
		Event handler for when .sugg-remove is clicked<br />
		{jQuery.Event} `evt` The click event<br />
		Returns: {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>`_onTagClick`</strong>(evt)<br />
		Event handler for when .sugg-tag is clicked<br />
		{jQuery.Event} `evt` The click event<br />
		Returns: {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>`_onListMouseover`</strong>(evt)<br />
		Event handler for when autosuggest list is moused over<br />
		{jQuery.Event} `evt` The mouseover event<br />
		Returns: {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>`_onListClick`</strong>(evt)<br />
		Event handler for when autosuggest list is clicked<br />
		{jQuery.Event} `evt` The click event<br />
		Returns: {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>`_onBoxClick`</strong>(evt)<br />
		Event handler for when this.$box is clicked<br />
		{jQuery.Event} `evt` The click event<br />
		Returns: {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>`_onKeydown`</strong>(evt)<br />
		Handle keypresses while in tag input field<br />
		{jQuery.Event} `evt` The keydown event<br />
		Returns: {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>`_onValueChange`</strong>(evt)<br />
		Handle paste on this.$input<br />
		{jQuery.Event} `evt` The paste event<br />
		Returns: {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>`_key_UP`</strong>(evt)<br />
		Handle UP key on this.$input<br />
		{jQuery.Event} `evt` The keydown event<br />
		Returns: {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>`_key_DOWN`</strong>(evt)<br />
		Handle DOWN key on this.$input<br />
		{jQuery.Event} `evt` The keydown event<br />
		Returns: {undefined}
	</td>
</tr>

<tr>
	<td>
		{Suggester} <strong>`addData`</strong>(data)<br />
		Add data to all instances<br />
		{Object[]} `data` Add more data to all the registered instances<br />
		Returns: {Suggester} 
	</td>
</tr>

<tr>
	<td>
		{jQuery.Event} <strong>`publish`</strong>(type, data)<br />
		Publish the given event name and send the given data<br />
		{String} `type` The name of the event to publish{Object} `data` Additional data to attach to the event object<br />
		Returns: {jQuery.Event} The event object which behaves much like a DOM event object
	</td>
</tr>

</table>

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

**Version 1.1.0, May 2013**

*Grunt build process*

*Suggester.tags is now a collection of $.Suggester.Tag objects*

**Version 1.0.2, April 2013**

*CSS classes for sugg-active and sugg-placeholder-on*

*Fix BeforeAdd event to let value to be altered and AfterAdd event to include record*

*Documentation fixes*

**Version 1.0pre, December 2012**

*initial version*

License
-

Copyright 2012-2013, Ken Snyder

[MIT License](http://www.opensource.org/licenses/mit-license.php)

Inspired by the AutoSuggest plugin by Drew Wilson