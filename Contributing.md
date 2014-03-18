# Contributing

## Important notes
Please don't edit files in the `dist` subdirectory as they are generated via Grunt. You'll find source code in the `src` subdirectory!

### Code style
Regarding code style like indentation and whitespace, **use tabs and follow other conventions you see used in the source already.**

### PhantomJS
While Grunt can run the included unit tests via [PhantomJS](http://phantomjs.org/), this shouldn't be considered a substitute for the real thing. Please be sure to test the `test/*.html` unit test file(s) in _actual_ browsers.

## Modifying the code
First, ensure that you have the latest [Node.js](http://nodejs.org/) and [npm](http://npmjs.org/) installed.

Test that Grunt's CLI is installed by running `grunt --version`.  If the command isn't found, run `npm install -g grunt-cli`.  For more information about installing Grunt, see the [getting started guide](http://gruntjs.com/getting-started).

1. Fork and clone the repo.
1. Run `npm install` to install all dependencies (including Grunt).
1. Run `grunt` to compile the project.

Assuming that you don't see any errors, you're ready to go.

## Submitting pull requests

1. Create a new local branch
1. Run `grunt watch` to run jshint and jQunit when any file changes
1. Add failing test to a .js file inside the test directory
1. Add part of a feature to pass the test
1. Repeat steps 2-4 until your feature is complete
1. Open `test/*.html` unit test file(s) in actual browser to ensure tests pass in your browsers of choice
1. Update the source code documentation to reflect any changes
1. Push to your fork and submit a pull request
