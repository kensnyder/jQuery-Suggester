Suggester - A Better Autocomplete Widget
=

Version 1.4.0, Aug 2014, MIT License

[Download](https://github.com/kensnyder/jQuery-Suggester/blob/master/Suggester-1.4.0-Download.zip?raw=true), [Demos](http://sandbox.kendsnyder.com/jQuery-Suggester/demos/), [Unit tests](http://sandbox.kendsnyder.com/jQuery-Suggester/test/index.html)

Usage: `var suggester = new $.Suggester($input, options);`

Table of Contents
-

<ul>
	<li><a href="#introduction">Introduction</a></li>
	<li><a href="#how-to-use">How to Use</a></li>
	<li><a href="#options">Options</a></li>
	<li><a href="#events">Events</a></li>
	<li><a href="#instance-properties">Instance Properties</a></li>
	<li><a href="#static-properties">Static Properties</a></li>
	<li><a href="#instance-methods">Instance Methods</a></li>
	<li><a href="#static-methods">Static Methods</a></li>
	<li><a href="#more-examples">More Examples</a></li>
	<li><a href="#changelog">Changelog</a></li>
	<li><a href="#contributing">Contributing</a></li>
	<li><a href="#reporting-bugs">Reporting Bugs</a></li>
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
* Unit tested - [Unit tests](http://sandbox.kendsnyder.com/jQuery-Suggester/test/index.html) 
* Works on IE8+, FF, Chrome, Safari
* 5kb minimized and gzipped
* Compatible with AMD


How to Use
-

Suggester is compatible with jQuery 1.5+ and has been unit tested with jQuery 1.9. Download the files in [Suggester-1.4.0-Download.zip](https://github.com/kensnyder/jQuery-Suggester/blob/master/Suggester-1.4.0-Download.zip?raw=true) and copy them to your scripts directory. Include them in your document's after jQuery is included:

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
		<td>false</td>
		<td>Initial data to use for suggestions</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>valueProperty</strong></td>
		<td>&quot;value&quot;</td>
		<td>The name of object property that should be used as the tag&#x27;s value. Only applicable when options.data is set</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>labelProperty</strong></td>
		<td>&quot;value&quot;</td>
		<td>The name of object property that should be used as the tag&#x27;s display text. Only applicable when options.data is set</td>
	</tr>
	<tr>
		<td>{Array}</td>
		<td><strong>searchProperties</strong></td>
		<td>Array(&quot;value&quot;)</td>
		<td>The array of object property names that should be searched when generating suggestions. Only applicable when options.data is set</td>
	</tr>
	<tr>
		<td>{String|Number}</td>
		<td><strong>matchAt</strong></td>
		<td>&quot;anywhere&quot;</td>
		<td>Where to match when finding suggestions. It can be &quot;anywhere&quot;, &quot;start&quot;, &quot;end&quot; or an integer. Only applicable when options.data is set</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>caseSensitive</strong></td>
		<td>false</td>
		<td>If true, find matches regardless of case. Only applicable when options.data is set. Only applicable when options.data is set</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>dataUrl</strong></td>
		<td>false</td>
		<td>Url to call to get json or jsonp results. Use %s to indicate where search text should be inserted. e.g. &quot;http://example.com/myjson?query=%s&quot; or &quot;http://example.com/myjsonp?query=%s&amp;callback=%s&quot;</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>dataType</strong></td>
		<td>&quot;json&quot;</td>
		<td>Can be &quot;json&quot; or &quot;jsonp&quot;. If json, options.dataUrl needs to be in the format &quot;http://example.com/myjsonp?query=%s&amp;mycallback=%s&quot;. To handle xml, you&#x27;ll need to register BeforeFetch and AfterFetch handlers or overwrite the fetchResults method</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>fly</strong></td>
		<td>&quot;down&quot;</td>
		<td>Which way should the suggestion box fly. If &quot;up&quot;, the suggestion box will appear before the input box in the DOM tree. A css class of &quot;sugg-fly-up&quot; or &quot;sugg-fly-down&quot; is applied to the widget element based on this value</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>suggListPosition</strong></td>
		<td>&quot;relative&quot;</td>
		<td>If &quot;absolute&quot;, the suggestion box will be appended to &lt;body&gt; and positioned and sized each time it is opened. This is useful for widgets within table elements</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>multiselect</strong></td>
		<td>true</td>
		<td>If true, allow multiple tags</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>preventDuplicates</strong></td>
		<td>true</td>
		<td>If true, the first tag will be removed when a duplicate is typed in</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>omitAlreadyChosenItems</strong></td>
		<td>true</td>
		<td>If true, don&#x27;t suggest items that have already been chosen as tags. Only applicable when options.data is set</td>
	</tr>
	<tr>
		<td>{Number}</td>
		<td><strong>minChars</strong></td>
		<td>3</td>
		<td>The minimum number of characters a user must type before the suggestion box will appear. If 0, show choices when input is simply focused (like a faux select widget)</td>
	</tr>
	<tr>
		<td>{Number}</td>
		<td><strong>keyDelay</strong></td>
		<td>200</td>
		<td>The number of milliseconds between keystrokes before the suggestion lookup begins</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>addOnComma</strong></td>
		<td>true</td>
		<td>If true, typing a comma will add the current text as a tag</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>addOnTab</strong></td>
		<td>true</td>
		<td>If true, typing a tab will add the current text as a tag</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>addOnSemicolon</strong></td>
		<td>false</td>
		<td>If true, typing a semicolon will add the current text as a tag</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>addOnSubmit</strong></td>
		<td>true</td>
		<td>If true, add tag on submit if user has entered text but not typed comma or tab</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>addOnBlur</strong></td>
		<td>false</td>
		<td>If true, add tag on blur if user has entered text but not typed comma or tab</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>submitOnEnter</strong></td>
		<td>false</td>
		<td>If false, prevent the form from submitting when the user presses enter on the empty input</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>inputSize</strong></td>
		<td>auto</td>
		<td>Manually set the input size property to a certain width. If auto, set size to text width</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>placeholder</strong></td>
		<td></td>
		<td>Placeholder text to display when no tags are present. e.g. &quot;Enter tags...&quot;</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>emptyText</strong></td>
		<td></td>
		<td>Message to show when there are no suggestions - default is &quot;(Type a comma to create a new item)&quot;</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>prompt</strong></td>
		<td></td>
		<td>Message to display in suggestion list when below min char length</td>
	</tr>
	<tr>
		<td>{Number}</td>
		<td><strong>maxSuggestions</strong></td>
		<td>10</td>
		<td>Only display this many suggestions (use 0 for no limit)</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>saveToInput</strong></td>
		<td>true</td>
		<td>If true, save back to original input each time a tag is added or removed</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>addHiddenInputs</strong></td>
		<td>true</td>
		<td>If true, also add a hidden input for each tag (fieldname_tag[]) for easier server-side processing (See options.hiddenName to create a custom name)</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>hiddenName</strong></td>
		<td></td>
		<td>The name to use for hidden elements (defaults to the original input&#x27;s name plus &quot;_tags[]&quot;)</td>
	</tr>
	<tr>
		<td>{Boolean}</td>
		<td><strong>highlightSubstring</strong></td>
		<td>true</td>
		<td>If true, wrap first matching substring in each suggestion with &lt;strong class=&quot;sugg-match&quot;&gt;&lt;/strong&gt;</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>template</strong></td>
		<td></td>
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
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>listItemTemplate</strong></td>
		<td></td>
		<td>Override the .sugg-item element in options.template</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>theme</strong></td>
		<td>&quot;coolblue&quot;</td>
		<td>The css class to add to widget (e.g. &quot;sugg-theme-coolblue&quot;). The following themes come predefined in the CSS: &quot;coolblue&quot;, &quot;faceblue&quot;, &quot;graybox&quot;, &quot;grayred&quot;</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onInitialize</strong></td>
		<td></td>
		<td>Add a Initialize event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onChange</strong></td>
		<td></td>
		<td>Add a Change event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onDefaultSuggestions</strong></td>
		<td></td>
		<td>Add a DefaultSuggestions event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeAdd</strong></td>
		<td></td>
		<td>Add a BeforeAdd event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeAjax</strong></td>
		<td></td>
		<td>Add a BeforeAjax event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeClose</strong></td>
		<td></td>
		<td>Add a BeforeClose event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeFetch</strong></td>
		<td></td>
		<td>Add a BeforeFetch event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeFilter</strong></td>
		<td></td>
		<td>Add a BeforeFilter event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeFormat</strong></td>
		<td></td>
		<td>Add a BeforeFormat event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeHandleKey</strong></td>
		<td></td>
		<td>Add a BeforeHandleKey event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeMove</strong></td>
		<td></td>
		<td>Add a BeforeMove event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeOpen</strong></td>
		<td></td>
		<td>Add a BeforeOpen event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeRemove</strong></td>
		<td></td>
		<td>Add a BeforeRemove event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeRender</strong></td>
		<td></td>
		<td>Add a BeforeRender event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeSave</strong></td>
		<td></td>
		<td>Add a BeforeSave event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeSubmit</strong></td>
		<td></td>
		<td>Add a BeforeSubmit event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onBeforeSuggest</strong></td>
		<td></td>
		<td>Add a BeforeSuggest event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterAdd</strong></td>
		<td></td>
		<td>Add a AfterAdd event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterAjax</strong></td>
		<td></td>
		<td>Add a AfterAjax event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterClose</strong></td>
		<td></td>
		<td>Add a AfterClose event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterFetch</strong></td>
		<td></td>
		<td>Add a AfterFetch event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterFilter</strong></td>
		<td></td>
		<td>Add a AfterFilter event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterFormat</strong></td>
		<td></td>
		<td>Add a AfterFormat event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterHandleKey</strong></td>
		<td></td>
		<td>Add a AfterHandleKey event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterMove</strong></td>
		<td></td>
		<td>Add a AfterMove event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterOpen</strong></td>
		<td></td>
		<td>Add a AfterOpen event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterRemove</strong></td>
		<td></td>
		<td>Add a AfterRemove event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterSave</strong></td>
		<td></td>
		<td>Add a AfterSave event</td>
	</tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onAfterSuggest</strong></td>
		<td></td>
		<td>Add a AfterSuggest event</td>
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
// Register events later (OOP style)
var instance = new $.Suggester(selector, {
	data: myData
});
instance.on('BeforeOpen', doStuff);
// Register events later (jQuery style)
$(input).suggester({
	data: myData
}).suggester('on', 'BeforeOpen', doStuff);
```

How is data passed to event callbacks?

* Each event callback receives one argument: `event`
* `event` is a jQuery event object
* `event` also contains useful information related to the event. See the [Events](#events) section below for more information.
* When an event has a default action that can be prevented, `event` will have property `cancelable` set to true and `event.isCancelable()` will return true
* To prevent a default action, call `event.preventDefault()`
* To cancel the firing of other attached callbacks, call `event.stopImmediatePropagation()`
* In some case, altering information on the `event` object will change the behavior of the default action
* The callback will be fired in the scope of the Suggester instance. In other words, using `this` in the callback will refer to the Suggester instance. See the [Instance Properties](#instance-properties) and [Instance Methods](#instance-methods) sections below for more information.

The following is a description of each event.

<table>
	<tr>
		<th>Event</th>
		<th>Data available on <code>event</code></th>
		<th>Effect of `event.preventDefault()`</th>
	</tr>
	<tr>
		<td><strong>BeforeAdd</strong><br />Fired before a tag is added</td>
		<td>
			{String} <strong>value</strong> The tag to be added (writeable)<br />
			{String} <strong>label</strong> The value of the tag to be added (writeable)<br />
			{jQuery} <strong>item</strong> The suggestion that was chosen, if any (writeable)<br />
			{Object} <strong>record</strong> The record that was chosen, if any (writeable)<br />
		</td>
		<td>The tag is not added</td>
	</tr>
	<tr>
		<td><strong>AfterAdd</strong><br />Allows you to take action after a tag is added</td>
		<td>
			{Suggester.Tag} <strong>tag</strong> The tag object that was added. Has methods such as getElement(), getHidden(), getValue(), getLabel(), etc.<br />
			{jQuery} <strong>item</strong> The suggestion that was chosen, if any<br />
			{String} <strong>record</strong> The record that was chosen, if any<br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>BeforeAjax</strong><br />Edit settings before ajax request is sent</td>
		<td>
			{Object} <strong>settings</strong> Settings sent to $.ajax()<br />
			{String} <strong>term</strong> The term for which we will search<br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>AfterAjax</strong><br />Access the jqXHR after initiating the ajax call but before it returns</td>
		<td>
			{Object} <strong>settings</strong> Settings sent to $.ajax()<br />
			{String} <strong>term</strong> The term which was searched<br />
			{JqXHR} <strong>jqXHR</strong> The jquery XMLHttpRequest object<br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>BeforeBlur</strong><br />Respond after user clicks or tabs out of input box</td>
		<td>
			{jQuery.Event} <strong>event</strong> The blur event<br />
			{String} <strong>value</strong> The current value in the input box. Changing it will change the effictive value.<br />
		</td>
		<td>Input box remains focused</td>
	</tr>
	<tr>
		<td><strong>AfterBlur</strong><br />Respond after input box has blurred</td>
		<td>
			{jQuery.Event} <strong>event</strong> The blur event<br />
			{String} <strong>value</strong> The current value in the input box<br />
			{jQuery|undefined} <strong>newTag</strong> The new tag or undefined if the tag was not added on blur<br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>Change</strong><br />Fired after a tag is added or removed or after value is manually set</td>
		<td>
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>BeforeClose</strong><br />Fired before suggestion box is hidden</td>
		<td>
		</td>
		<td>Suggestion box will stay open</td>
	</tr>
	<tr>
		<td><strong>AfterClose</strong><br />Fired after suggestion box is hidden</td>
		<td>
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>DefaultSuggestions</strong><br />Fired when options.minChars is 0 to allow you to update how default suggestions are displayed. e.g. show the most commonly used values</td>
		<td>
			{Array} <strong>suggetions</strong> The suggestions to show by default. Defaults to the first options.maxSuggestions within this.data. Edit value to use your own suggestions.<br />
		</td>
		<td>No default suggestions are displayed</td>
	</tr>
	<tr>
		<td><strong>BeforeFetch</strong><br />A chance to access the jqXHR before the ajax request has been sent</td>
		<td>
			{JqXHR} <strong>jqXHR</strong> the jQuery XHR object (see http://api.jquery.com/jQuery.ajax/#jqXHR)<br />
			{String} <strong>term</strong> the term that is being searched for<br />
		</td>
		<td>XHR is aborted</td>
	</tr>
	<tr>
		<td><strong>AfterFetch</strong><br /></td>
		<td>
			{JqXHR} <strong>jqXHR</strong> The jQuery XHR object (see http://api.jquery.com/jQuery.ajax/#jqXHR)<br />
			{Object[]} <strong>records</strong> The Array of record objects returned from the XHR<br />
			{String} <strong>term</strong> The term that was search for<br />
		</td>
		<td>Nothing is done with results (i.e. suggestion box is not built and displayed)</td>
	</tr>
	<tr>
		<td><strong>BeforeFilter</strong><br />Called before the search for results</td>
		<td>
			{String} <strong>text</strong> The text to search for<br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>AfterFilter</strong><br />Called after the search for results</td>
		<td>
			{String} <strong>text</strong> The that was searched for<br />
			{Array} <strong>results</strong> The array of records that matched (writeable)<br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>AfterFocus</strong><br />Respond after input box has focused</td>
		<td>
			{jQuery.Event} <strong>event</strong> The focus event<br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>BeforeFormat</strong><br />Call to dynamically inject your own formatting on each suggestion</td>
		<td>
			{Object} <strong>record</strong> The record object that is being suggested<br />
			{String} <strong>substr</strong> The part of the string that matches the suggestion search fields<br />
			{String} <strong>html</strong> If you set event.html, it will be used instead of constructing the HTML<br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>AfterFormat</strong><br />Alter the HTML that has been constructed before it is put into the DOM</td>
		<td>
			{Object} <strong>record</strong> The record object that is being suggested<br />
			{String} <strong>substr</strong> The part of the string that matches the suggestion search fields<br />
			{String} <strong>html</strong> Change the HTML before it is put into the dom<br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>BeforeHandleKey</strong><br />Access the keydown event before Suggester processes it</td>
		<td>
			{Event} <strong>keydown</strong> The keydown event (a raw browser event, not jQuery.Event)<br />
		</td>
		<td>Key is not handled by Suggester. You may want to call event.keydown.preventDefault();</td>
	</tr>
	<tr>
		<td><strong>AfterHandleKey</strong><br />Access the keydown event after Suggester processes it</td>
		<td>
			{Event} <strong>keydown</strong> The keydown event (a raw browser event, not jQuery.Event)<br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>Initialize</strong><br />Do something after the widget is completely rendered and initialized. Note that it fires during instantiation, so an onInitialize property must be set in the constructor.</td>
		<td>
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>BeforeMove</strong><br />Fire in response to up or down arrow while suggestion list is focused</td>
		<td>
			{String} <strong>direction</strong> &quot;up&quot; or &quot;down&quot;<br />
			{jQuery|null} <strong>current</strong> jQuery object with the currently selected item or null if there isn&#x27;t one (writeable)<br />
			{jQuery|null} <strong>next</strong> jQuery object with the item that will be selected next (writeable)<br />
		</td>
		<td>Movement is cancelled</td>
	</tr>
	<tr>
		<td><strong>AfterMove</strong><br />Fired after selected suggestion is changed in response to up or down arrow</td>
		<td>
			{String} <strong>direction</strong> &quot;up&quot; or &quot;down&quot;<br />
			{jQuery|null} <strong>last</strong> The previously selected item<br />
			{jQuery} <strong>current</strong> The newly selected item<br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>BeforeOpen</strong><br />Fires before suggestion box is displayed</td>
		<td>
		</td>
		<td>Box is not displayed</td>
	</tr>
	<tr>
		<td><strong>AfterOpen</strong><br />Fires after suggestion box is displayed</td>
		<td>
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>BeforePaste</strong><br />Respond before values are pasted</td>
		<td>
			{jQuery.Event} <strong>event</strong> The paste event<br />
			{String} <strong>value</strong> The raw value that was pasted<br />
			{Array} <strong>tags</strong> The array of tags to be added (if the value was successfully split on tab, semicolon, or comma). If changed, the added tags will change.<br />
		</td>
		<td>tags are not added and paste is cancelled</td>
	</tr>
	<tr>
		<td><strong>AfterPaste</strong><br />Respond after values are pasted</td>
		<td>
			{jQuery.Event} <strong>event</strong> The paste event<br />
			{String} <strong>value</strong> The raw value that was pasted<br />
			{Array} <strong>tags</strong> The array of tags that were added (if the value was successfully split on tab, semicolon, or comma)<br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>BeforeRemove</strong><br />Fired before a tag is removed</td>
		<td>
			{jQuery} <strong>tag</strong> The tag to be removed<br />
			{String} <strong>value</strong> The value of the tag to be removed (writeable)<br />
			{String} <strong>label</strong> The label of the tag to be removed<br />
		</td>
		<td>The tag will not be removed</td>
	</tr>
	<tr>
		<td><strong>AfterRemove</strong><br />Fired after a tag is removed</td>
		<td>
			{jQuery} <strong>tag</strong> The tag element that was removed<br />
			{String} <strong>value</strong> The value of the tag that was removed<br />
			{String} <strong>label</strong> The label of the tag that was removed<br />
			{Suggester.Tag} <strong>The</strong> tag object that was removed<br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>BeforeRender</strong><br />Modify this.$widget or any of its child elements before it is manipulated or appended. Can be used to modify this.options.template with DOM methods. Note that it fires during instantiation, so an onBeforeRender property must be set in the constructor.</td>
		<td>
			{jQuery} <strong>widget</strong> A reference to this.$widget<br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>AfterRender</strong><br />Do something after the widget is completely rendered. Note that it fires during instantiation, so an onAfterRender property must be set in the constructor.</td>
		<td>
			{jQuery} <strong>widget</strong> A reference to this.$widget<br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>BeforeSave</strong><br />Inject functionality before saving</td>
		<td>
			{String} <strong>newValue</strong> The value that will be written to the original input (writeable)<br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>AfterSave</strong><br />Do something after saving value to original input</td>
		<td>
			{String} <strong>oldValue</strong> The value before saving<br />
			{String} <strong>newValue</strong> The value that was written to the original input<br />
		</td>
		<td>-</td>
	</tr>
	<tr>
		<td><strong>BeforeSubmit</strong><br />Respond before form is submitted and before Suggester adds on submit</td>
		<td>
			{jQuery.Event} <strong>The</strong> jQuery-wrapped browser event<br />
			{HTMLFormElement} <strong>form</strong> The input&#x27;s form (same as this.$form)<br />
		</td>
		<td>Form will not be submitted</td>
	</tr>
	<tr>
		<td><strong>BeforeSuggest</strong><br />Modify suggestion box behavior before it opens</td>
		<td>
			{String} <strong>text</strong> The text that was searched for<br />
		</td>
		<td>The suggestion list is built but not displayed</td>
	</tr>
	<tr>
		<td><strong>AfterSuggest</strong><br />Fires after displaying suggestions</td>
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
		<td>{jQuery}</td>
		<td><strong>$originalInput</strong></td>
		<td>The input used to make the widget</td>
	</tr>
	<tr>
		<td>{Object[]}</td>
		<td><strong>data</strong></td>
		<td>Array of static data used instead of an ajax call</td>
	</tr>
	<tr>
		<td>{Suggester.Tag[]}</td>
		<td><strong>tags</strong></td>
		<td>An array of Suggester.Tag objects</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>hiddenName</strong></td>
		<td>The name to use for hidden elements (defaults to the original input&#x27;s name plus &quot;_tags[]&quot;)</td>
	</tr>
	<tr>
		<td>{jQuery}</td>
		<td><strong>$focusedTag</strong></td>
		<td>The tag that is selected for deletion</td>
	</tr>
	<tr>
		<td>{jQuery}</td>
		<td><strong>$currentItem</strong></td>
		<td>The item currently selected in the suggestion box</td>
	</tr>
	<tr>
		<td>{jQuery}</td>
		<td><strong>pubsub</strong></td>
		<td>The publish and subscribe handle - equal to $(this)</td>
	</tr>
	<tr>
		<td>{jQuery}</td>
		<td><strong>$widget</strong></td>
		<td>The element that wraps the widget</td>
	</tr>
	<tr>
		<td>{jQuery}</td>
		<td><strong>$box</strong></td>
		<td>The container that holds the chosen tags</td>
	</tr>
	<tr>
		<td>{jQuery}</td>
		<td><strong>$tagTemplate</strong></td>
		<td>The tag element that is cloned to make new tags</td>
	</tr>
	<tr>
		<td>{jQuery}</td>
		<td><strong>$input</strong></td>
		<td>The input that users type in</td>
	</tr>
	<tr>
		<td>{jQuery}</td>
		<td><strong>$inputWrapper</strong></td>
		<td>The container for the input</td>
	</tr>
	<tr>
		<td>{jQuery}</td>
		<td><strong>$suggList</strong></td>
		<td>The suggestion list element</td>
	</tr>
	<tr>
		<td>{jQuery}</td>
		<td><strong>$suggListWrapper</strong></td>
		<td>The element that is positioned relatively to hold the absolutely positioned suggestion list</td>
	</tr>
	<tr>
		<td>{jQuery}</td>
		<td><strong>$empty</strong></td>
		<td>The element enclosing the empty text</td>
	</tr>
	<tr>
		<td>{jQuery}</td>
		<td><strong>$prompt</strong></td>
		<td>The element enclosing the prompt</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>listItemTemplate</strong></td>
		<td>The html to use for suggestion list items</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>_searchTerm</strong></td>
		<td>The search term we are currently searching for</td>
	</tr>
	<tr>
		<td>{String}</td>
		<td><strong>_text</strong></td>
		<td>The text in the input box that will be used to fetch results (i.e. what the user just typed)</td>
	</tr>
	<tr>
		<td>{JqXHR}</td>
		<td><strong>_jqXHR</strong></td>
		<td>The jQuery XHR object used initilized for fetching data - http://api.jquery.com/jQuery.ajax/#jqXHR</td>
	</tr>
	
</table>
			
Static Properties
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
See constructor for documentation on each option</td>
	</tr>
	<tr>
		<td>{Array}</td>
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
		<strong>destroy</strong>([options])<br />
		Completely remove Suggester widget and unhide the original input box (with values populated)<br />
		<strong>@param</strong> {Object} [options] <br />
		<strong>@return</strong> {jQuery} The original input
	</td>
</tr>

<tr>
	<td>
		<strong>add</strong>(value[, label=value][, $item])<br />
		Add a tag by a record or value<br />
		<strong>@param</strong> {String} value the tag to add<strong>@param</strong> {String} [label=value] the text to display in the new tag<strong>@param</strong> {jQuery} [$item] Set internally when the record is added by choosing from the suggestion box<br />
		<strong>@return</strong> {jQuery} The jQuery object containing the newly created label or undefined if one was not created
	</td>
</tr>

<tr>
	<td>
		<strong>pushTag</strong>(value, label)<br />
		Add a tag directly without triggering BeforeAdd or AfterAdd<br />
		<strong>@param</strong> {String|Number} value The value of the tag<strong>@param</strong> {String} label The text to display on the tag<br />
		<strong>@return</strong> {Suggester.Tag} The new tag object
	</td>
</tr>

<tr>
	<td>
		<strong>addCurrentBuffer</strong>()<br />
		Add a tag with the contents of the input; e.g. when the user has typed something but clicks on another part of the form
Note: this happens on blur when this.options.addOnBlur is true
		<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>moveSelection</strong>([direction=up])<br />
		Move the selection up or down in the suggestion box<br />
		<strong>@param</strong> {String} [direction=up] Either &quot;up&quot; or &quot;down&quot;<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>selectItem</strong>($tag)<br />
		Select a suggestion<br />
		<strong>@param</strong> {jQuery} $tag <br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>deselectItem</strong>($tag)<br />
		Deselect a suggestion<br />
		<strong>@param</strong> {jQuery} $tag <br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>deselectAllItems</strong>()<br />
		Deselect all suggestions
		<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>suggest</strong>(text)<br />
		Open suggestion list for the given text<br />
		<strong>@param</strong> {String} text <br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>addData</strong>(data)<br />
		Add more data records to the autosuggest list. Does not apply when dataUrl is set<br />
		<strong>@param</strong> {Object[]} data More records in the same object format as initially set<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>setData</strong>(data)<br />
		Set data records to the autosuggest list. Does not apply when dataUrl is set<br />
		<strong>@param</strong> {Object[]} data <br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>getData</strong>()<br />
		Get all the records in the autosuggest list. Does not apply when dataUrl is set
		<br />
		<strong>@return</strong> {Object[]} 
	</td>
</tr>

<tr>
	<td>
		<strong>setFlyDirection</strong>(direction)<br />
		Set the direction of the suggestion menu, to fly upwards or downwards<br />
		<strong>@param</strong> {String} direction either &quot;up&quot; or &quot;down&quot;<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>focusTag</strong>($tag)<br />
		Focus on a previously added tag<br />
		<strong>@param</strong> {jQuery} $tag The .sugg-tag element to focus<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>unfocusTag</strong>()<br />
		Unfocus the previously focussed tag
		<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>removeFocusedTag</strong>(evt)<br />
		Remove the focused tag<br />
		<strong>@param</strong> {jQuery.Event} evt (optional)  Used to check if $document keypress is backspace or delete<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>remove</strong>($tag)<br />
		Remove a tag given its text or jQuery element or HTML element<br />
		<strong>@param</strong> {String|jQuery|HTMLElement} $tag the tag to remove<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>findRecord</strong>(text)<br />
		Find a suggestion record by text. Only applies when this.options.data is set.<br />
		<strong>@param</strong> {String} text The text to search for<br />
		<strong>@return</strong> {Object|false} The matched record object or false if nothing matched.
	</td>
</tr>

<tr>
	<td>
		<strong>searchData</strong>(value, props)<br />
		Search through this.data to find a record with a value or label equal to the given value<br />
		<strong>@param</strong> {String} value The value or label to find<strong>@param</strong> {Array} props An array of strings of property names to search<br />
		<strong>@return</strong> {Object|Boolean} Returns the record if found, false if not found
	</td>
</tr>

<tr>
	<td>
		<strong>suggestIfNeeded</strong>()<br />
		Initiate suggestion process if the input text is &gt;= this.options.minChars, otherwise show prompt
		<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>showPrompt</strong>()<br />
		Show the prompt text to give a hint to users. Only called when there are no items and this.options.prompt is truthy
		<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>showEmptyText</strong>()<br />
		Show text indicating there are no suggestions - defined in this.options.emptyText
		<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>fetchResults</strong>(text)<br />
		Fetch suggestions from an ajax URL<br />
		<strong>@param</strong> {String} text The text to search for<br />
		<strong>@return</strong> {JqXHR} The jQuery XHR transport that is fetching the data
	</td>
</tr>

<tr>
	<td>
		<strong>abortFetch</strong>()<br />
		Cancel the XHR. Used when user starts typing again before XHR completes
		<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>handleSuggestions</strong>(records)<br />
		Take the given records and build and display suggestion box. Usually only called internally.<br />
		<strong>@param</strong> {Array} records The result records to use to build the suggestion list<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>isSuggestBoxOpen</strong>()<br />
		Return true if suggestion box is open
		<br />
		<strong>@return</strong> {Boolean} 
	</td>
</tr>

<tr>
	<td>
		<strong>openSuggestBox</strong>()<br />
		Manually open the suggestion box in whatever state it is. Usually only called internally.
		<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>closeSuggestBox</strong>()<br />
		Hide the suggestion box
		<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>focus</strong>()<br />
		Focus cursor on text input box
		<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>blur</strong>()<br />
		Unfocus the cursor from the text input box
		<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>getResults</strong>(text)<br />
		Get suggestion result records given some text (local data)<br />
		<strong>@param</strong> {String} text Gather suggestions based on this text<br />
		<strong>@return</strong> {Array} Array of Objects of matching records
	</td>
</tr>

<tr>
	<td>
		<strong>clear</strong>()<br />
		Clear all the chosen tags
		<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>getTags</strong>()<br />
		Get a collection of all the chosen tag objects (a shallow copy of this.tags)
		<br />
		<strong>@return</strong> {Array} 
	</td>
</tr>

<tr>
	<td>
		<strong>eachTag</strong>(iterator)<br />
		Iterate through each of the chosen tag objects<br />
		<strong>@param</strong> {Function} iterator The iterator function - function(i, tag) {}<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>serialize</strong>()<br />
		Return a URL query string representing the hidden values of the input
		<br />
		<strong>@return</strong> {String} 
	</td>
</tr>

<tr>
	<td>
		<strong>getValues</strong>()<br />
		Pluck all the tag values from the chosen tags
		<br />
		<strong>@return</strong> {Array} 
	</td>
</tr>

<tr>
	<td>
		<strong>getValue</strong>()<br />
		Get the current value as a comma-delimited string
		<br />
		<strong>@return</strong> {String} 
	</td>
</tr>

<tr>
	<td>
		<strong>_handleEmptyValue</strong>()<br />
		Helper function for setValue()
		<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>setTheme</strong>(themeName)<br />
		Set the widget&#x27;s CSS theme - Adds a class &quot;sugg-theme-%name%&quot; to the widget<br />
		<strong>@param</strong> {String} themeName The name of the theme to use<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>showPlaceholder</strong>([text=this.options.placeholder])<br />
		Replace the contents of this.$input with the placeholder value. Automatically fires when this.options.placeholder is set
And there are no tags and we are blurring or initially rendering<br />
		<strong>@param</strong> {String} [text=this.options.placeholder] The text to set for the placeholder (defaults to this.options.placeholder)<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>hidePlaceholder</strong>()<br />
		Replace placeholder string with empty text
		<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>publish</strong>(type[, data])<br />
		Publish the given event name and send the given data<br />
		<strong>@param</strong> {String} type The name of the event to publish<strong>@param</strong> {Object} [data] Additional data to attach to the event object<br />
		<strong>@return</strong> {jQuery.Event} The event object which behaves much like a DOM event object
	</td>
</tr>

<tr>
	<td>
		<strong>getInstance</strong>()<br />
		Get this instance. Useful for jQuery-style usage:  var instance = $(&#x27;input&#x27;).suggester(options).suggester(&#x27;getInstance&#x27;)
		<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>_processOptions</strong>(options)<br />
		Set options and interpret options<br />
		<strong>@param</strong> {Object} options Settings passed to constructor<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_render</strong>()<br />
		Render the widget and get handles to key elements
		<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_handleStartValue</strong>()<br />
		Look at the initial element&#x27;s start value and populate tags as appropriate
		<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_setupListeners</strong>()<br />
		Attach event handlers
		<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_onInputFocus</strong>(evt)<br />
		Event handler for when this.$input is focused<br />
		<strong>@param</strong> {jQuery.Event} evt The focus event<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_onInputBlur</strong>(evt)<br />
		Event handler for when this.$input is blurred<br />
		<strong>@param</strong> {jQuery.Event} evt blur event<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_onTagRemoveClick</strong>(evt)<br />
		Event handler for when .sugg-remove is clicked<br />
		<strong>@param</strong> {jQuery.Event} evt The click event<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_onTagClick</strong>(evt)<br />
		Event handler for when .sugg-tag is clicked<br />
		<strong>@param</strong> {jQuery.Event} evt The click event<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_onListMouseover</strong>(evt)<br />
		Event handler for when autosuggest list is moused over<br />
		<strong>@param</strong> {jQuery.Event} evt The mouseover event<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_onListClick</strong>(evt)<br />
		Event handler for when autosuggest list is clicked<br />
		<strong>@param</strong> {jQuery.Event} evt The click event<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_onBoxClick</strong>(evt)<br />
		Event handler for when this.$box is clicked<br />
		<strong>@param</strong> {jQuery.Event} evt The click event<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_onKeydown</strong>(evt)<br />
		Handle keypresses while in tag input field<br />
		<strong>@param</strong> {Event} evt The keydown event (a raw browser event, not jQuery.Event)<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_onCutDelete</strong>(evt)<br />
		Handle cut and delete on this.$input<br />
		<strong>@param</strong> {jQuery.Event} evt The cut, paste, or delete event<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_onPaste</strong>(evt)<br />
		Handle paste on this.$input. Look for places to split pasted value
For example pasting &quot;a, b, c&quot; will immediately add 3 tags (when this.options.addOnComma is true)
It attempts to split on tab, then if there are no tabs then semicolons, then if there are no semicolons, commas<br />
		<strong>@param</strong> {jQuery.Event} evt the paste event<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_key_UP</strong>(evt)<br />
		Handle UP key on this.$input<br />
		<strong>@param</strong> {Event} evt The keydown event<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_key_DOWN</strong>(evt)<br />
		Handle DOWN key on this.$input<br />
		<strong>@param</strong> {Event} evt The keydown event<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_key_BACKSPACE</strong>(evt)<br />
		Handle BACKSPACE key on this.$input<br />
		<strong>@param</strong> {Event} evt The keydown event<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_key_TAB_COMMA</strong>(evt)<br />
		Handle TAB and COMMA and SEMICOLON key on this.$input<br />
		<strong>@param</strong> {Event} evt The keydown event<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_key_ESC</strong>(evt)<br />
		Handle ESC key on this.$input<br />
		<strong>@param</strong> {Event} evt The keydown event<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_key_ENTER</strong>(evt)<br />
		Handle ENTER key on this.$input<br />
		<strong>@param</strong> {Event} evt The keydown event<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_key_other</strong>(evt)<br />
		Handle other keys (e.g. printable characters) on this.$input<br />
		<strong>@param</strong> {Event} evt The keydown event<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_onSubmit</strong>(jqEvent)<br />
		Handler for form submission<br />
		<strong>@param</strong> {jQuery} jqEvent The submit event<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_beforeFetch</strong>(jqXHR)<br />
		The handler function that is passed to $.ajax({beforeSend:...}) to alter XHR if needed<br />
		<strong>@param</strong> {JqXHR} jqXHR The jQuery XHR object (see http://api.jquery.com/jQuery.ajax/#jqXHR)<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_afterFetch</strong>(records)<br />
		Handler passed to $.ajax().done(function(){...}) that handles suggestion data that is returned<br />
		<strong>@param</strong> {Array} records The Array of record objects returned from the XHR<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_closeOnOutsideClick</strong>(evt)<br />
		Callback used to close the suggestion box when the user clicks off of it<br />
		<strong>@param</strong> {jQuery.Event} evt The click event<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_formatSuggestion</strong>(record, substr)<br />
		Format a suggestion before display<br />
		<strong>@param</strong> {Object} record The record that was suggested<strong>@param</strong> {String} substr The string that generated the list of suggestions<br />
		<strong>@return</strong> {String} HTML to use as the item (e.g. &#x27;&lt;li class=&quot;sugg-item&quot;&gt;Suggestion&lt;/li&gt;&#x27;)
	</td>
</tr>

<tr>
	<td>
		<strong>_updateInputSize</strong>()<br />
		Update the size when this.options.inputSize is &quot;auto&quot;
		<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>save</strong>()<br />
		Set the value of the original input to a comma-delimited set of labels
		<br />
		<strong>@return</strong> {String} The new value
	</td>
</tr>

<tr>
	<td>
		<strong>_spliceTag</strong>(value)<br />
		Given tag text, remove a tag from the internal collection and from the DOM<br />
		<strong>@param</strong> {String} value The text of the tag<br />
		<strong>@return</strong> {Object|undefined} The record associated with that tag or undefined if not found
	</td>
</tr>

<tr>
	<td>
		<strong>_spliceTagByIdx</strong>(idx)<br />
		Given an array index, remove a tag from the internal collection and from the DOM<br />
		<strong>@param</strong> {Number} idx The index position in the internal collection<br />
		<strong>@return</strong> {Suggester.Tag} The Suggester.Tag object that was removed
	</td>
</tr>

<tr>
	<td>
		<strong>getTagIndex</strong>(value)<br />
		Find a tag given value<br />
		<strong>@param</strong> {String} value The text of the tag<br />
		<strong>@return</strong> {Number} The index position of the tag in the internal collection or -1 if not found
	</td>
</tr>

<tr>
	<td>
		<strong>_setupPubsub</strong>()<br />
		Setup publish/subscribe system that uses jQuery&#x27;s event system. Allows subscribing this way: instance.on(&#x27;AfterFilter&#x27;, myhandler)
		<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>_isCursorAtStart</strong>()<br />
		Given an input element, get the cursor position. Used to determine if backspace key should delete the previous tag
		<br />
		<strong>@return</strong> {Boolean} true if the cursor is at the start and no text is selected
	</td>
</tr>

<tr>
	<td>
		<strong>setValue</strong>(valueOrValues)<br />
		Set the tags using an array or a comma-delimited string.
Commas inside the tag name may be escaped with a backslash.<br />
		<strong>@param</strong> {String|Array} valueOrValues To clear value, set to empty string, false, null or undefined<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

</table>

Static Methods
-

<table>

<tr>
	<td>
		<strong>addData</strong>(data)<br />
		Add data to all instances<br />
		<strong>@param</strong> {Object[]} data Add more data to all the registered instances<br />
		<strong>@return</strong> {Suggester} 
	</td>
</tr>

<tr>
	<td>
		<strong>subclass</strong>(jQueryMethodName[, properties])<br />
		Create a subclass of Suggester<br />
		<strong>@param</strong> {String} jQueryMethodName The method name to add to jQuery.fn<strong>@param</strong> {Object} [properties] Additional properties and methods to add to subclass<br />
		<strong>@return</strong> {Function} The new class object
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
suggester.on('AfterClose', doStuff);
suggester.focus();
```

See the source on the [live demos](http://sandbox.kendsnyder.com/jQuery-Suggester/demos/) for lots more examples.

Changelog
-

**Version 1.4.0, Aug 2014**
* new event DefaultSuggestions
* cite some jsPerf results
* change 'bind' to 'on' in examples and internal usage
* change default keyDelay to 200ms
* fix docs for static properties and methods

**Version 1.3.1, Apr 2014**
* Fix to hidePlaceholder()
* Fix input hidden name

**Version 1.3.0, Mar 2014**
* Fixes to setValue(), clear(), focus(), blur()
* Use `git watch`
* Documentation improvements
* More unit tests

**Version 1.2.2, Jul 2013**
* Fixes to add()
* Documentation improvements
* More unit tests

**Version 1.2.1, Jul 2013**
* Added onChange event
* Documentation fixes
* Tweaks on build process

**Version 1.2.0, Jun 2013**
* Allow pasting delimited values
* Speed improvements
* Search through this.data to find typed values when applicable

**Version 1.1.1, May 2013**
* Fixed Suggester#getValues()

**Version 1.1.0, May 2013**
* Grunt build process
* Suggester.tags is now a collection of $.Suggester.Tag objects

**Version 1.0.2, April 2013**
* CSS classes for sugg-active and sugg-placeholder-on
* Fix BeforeAdd event to let value to be altered and AfterAdd event to include record
* Documentation fixes

**Version 1.0pre, December 2012**
* initial version


Contributing
-

After using git to clone the repo, you'll need nodejs, npm, and grunt-cli installed. See [gruntjs.com](http://gruntjs.com/getting-started) for more information. Then inside the cloned directory run `npm install` and then `grunt`

Make updates only to the files in the `./src` directory. Then run `grunt` to automatically generate documentation and other files. You may also make changes to the demos by editing `./demos/*` files or improve the build process by editing `./Gruntfile.js`. Then make a pull request.


Reporting Bugs
-

To report bugs, add an issue to the [GitHub issue tracker](https://github.com/kensnyder/jQuery-Suggester/issues).


License
-

Copyright 2012-2013, Ken Snyder

[MIT License](http://www.opensource.org/licenses/mit-license.php)

Inspired by the AutoSuggest plugin by Drew Wilson