<%- pkg.title %>
=

Version <%- pkg.version %>, <%- grunt.template.today("mmm yyyy") %>, MIT License

[Demos](http://sandbox.kendsnyder.com/Suggester-1.1/demos), [Unit tests](http://sandbox.kendsnyder.com/Suggester-1.1/test/Suggester.html)

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
* 4kb minimized and gzipped
* Unit tested - [Unit tests](http://sandbox.kendsnyder.com/Suggester-1.1/test/Suggester.html) 
* Works on IE8+, FF, Chrome, Safari
* Compatible with AMD


How to Use
-

Suggester is compatible with jQuery 1.5+ and has been tested with jQuery 1.9. Download the files in [DOWNLOAD.zip](https://github.com/kensnyder/jQuery-Suggester/blob/master/DOWNLOAD.zip?raw=true) and copy them to your scripts directory. Include them in your document's after jQuery is included:

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
	<% _.forEach(options, function(option) { %><tr>
		<td>{<%- option.type.replace('JQuery','jQuery') %>}</td>
		<td><strong><%- option.name %></strong></td>
		<td><%- option.optdefault %></td>
		<td><%- option.description %></td>
	</tr>
	<% }); %>
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
* When an event has a default action that can be prevented, `event` will have property `cancelable` set to true and `event.isCancelable()` will return true
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
	<% _.forEach(events, function(event) { %><tr>
		<td><strong><%- event.name %></strong></td>
		<td><%- event.description %></td>
		<td>
		<% _.forEach(event.params || [], function(param) { %>	{<%- (param.type || '').replace('JQuery','jQuery') %>} <%- param.name %> <em><%- param.description %></em><br />
		<% }); %></td>
		<td><%- event.ifprevented || '-' %></td>
	</tr>
	<% }); %>
</table>
			
Instance Properties
-

<table>
	<tr>
		<th>Type</th>
		<th>Name</th>
		<th>Description</th>
	<tr>
	<% _.forEach(properties, function(prop) { %><tr>
		<td>{<%- prop.type.replace('JQuery','jQuery')%>}</td>
		<td><strong><%- prop.name %></strong></td>
		<td><%- prop.description %></td>
	</tr>
	<% }); %>
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
<% _.forEach(methods, function(method) { %>
<tr>
	<td>
		<strong><%- method.name %></strong>(<% _.forEach(method.params || [], function(param, i) { %><% if (param.optional) { %>[<% } %><% if (i !== 0) { %>, <% } %><%- param.name %><% if (param.optdefault !== undefined) { %>=<%- param.optdefault %><% } %><% if (param.optional) { %>]<% } %><% }); %>)<br />
		<%- method.description %><br />
		<% _.forEach(method.params || [], function(param, i) { %>{<%- param.type.replace('JQuery','jQuery') %>} <% if (param.optional) { %>[<% } %><%- param.name %><% if (param.optdefault !== undefined) { %>=<%- param.optdefault %><% } %><% if (param.optional) { %>]<% } %> <%- param.description %><% }); %><br />
		Returns: <% if (method.return) { %>{<%- method.return.type.replace('JQuery','jQuery') %>} <%- method.return.description %><% } else { %>{undefined}<% } %>
	</td>
</tr>
<% }); %>
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

See the source on the [live demos](http://sandbox.kendsnyder.com/Suggester-1.1/demos) for lots more examples.

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