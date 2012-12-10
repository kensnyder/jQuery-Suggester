Suggester for jQuery 
=

Version 1.0, December 2012

[Demos](http://sandbox.kendsnyder.com/Suggester/demo/demo.html)

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
* Fully unit tested - [Unit tests](http://sandbox.kendsnyder.com/Suggester/demo/unit-tests.html)

How to Use
-

Suggester is compatible with jQuery 1.5 and has been tested with jQuery 1.8. Add the following HTML to your &lt;head&gt;:

```html
<script src="./assets/js/jquery.js"></script>
<script src="/jquery.suggester.js"></script>
<link rel="stylesheet" href="../jquery.suggester.css" />
```

Example Usage
-

```javascript
$('.my-text-input').suggester({
    data: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    prompt: 'Enter a day of the week'
});
$('.my-text-input').suggester({
    dataUrl: 'http://example.com/myjson?query=%s&mycallback=%s',
    prompt: 'Enter a time zone'
});
var suggester = new $.Suggester('.my-text-input', {
	data: [{"label":"John Doe","value":"John Doe <John.Doe@example.com>"}/*,...*/],
    onAfterSave: function(event) {
        saveToServer(event.newValue);
    }
});
```

Change log
-

**Version 1.0, December 2012**

*initial version*

License
-

Copyright 2012, Ken Snyder

[MIT License](http://www.opensource.org/licenses/mit-license.php)

Inspired by the AutoSuggest plugin by Drew Wilson