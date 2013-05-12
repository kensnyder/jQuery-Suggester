'use strict';

module.exports = function(grunt) {

	var pkg = grunt.file.readJSON('Suggester.jquery.json');

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: pkg,
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
		'<%= grunt.template.today("mmm yyyy") %>\n' +
		'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
		'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
		' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
		// Task configuration.
		clean: {
			files: ['dist','docs']
		},
		copy: {
			main: {
				files: [
					{
						src: ['src/Suggester.css'], 
						dest: 'dist/Suggester.css'
					}
				]
			}
		},
		concat: {
			options: {
				banner: '<%= banner %>',
				stripBanners: true
			},
			dist: {
				src: ['src/<%= pkg.name %>.js'],
				dest: 'dist/<%= pkg.name %>.js'
			}
		},
		uglify: {
			options: {
				banner: '<%= banner %>'
			},
			dist: {
				src: '<%= concat.dist.dest %>',
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		},
		cssmin: {
			options: {
				banner: '/* jQuery Suggester <%= pkg.version %> */',
				report: 'gzip'
			},
			compress: {
				files: {
					'dist/Suggester.min.css': ['src/Suggester.css']
				}
			}
		},
		compress: {
			main: {
				options: {
					archive: 'jQuery-Suggester.zip'
				},
				files: [
					{src: ['dist/*'], dest: './', filter: 'isFile'}
				]
			}
		},
		qunit: {
			files: ['test/**/*.html']
		},
		jshint: {
			src: {
				options: {
					jshintrc: 'jshint.conf.json'
				},
				src: ['src/**/*.js']
			}
		},
		yuidoc: {
			compile: {
				name: '<%= pkg.name %>',
				description: '<%= pkg.description %>',
				version: '<%= pkg.version %>',
				url: '<%= pkg.homepage %>',
				options: {
					paths: ['src'],
					outdir: 'docs',
					parseOnly: false,
					logo: ''
				}
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');
	grunt.loadNpmTasks('grunt-contrib-compress');
	
//	var extract = {
//		main: function(js) {
//			var docs = {
//				event: [],
//				property: [],
//				method: [],
//				options: []
//			};
//			js.replace(/\/\*\*([\s\S]+?)\*\//g, function($0, $1) {
//				$1 = $1.replace(/@example [^\s\S]+\t\*/, '');
//				var lines = [];
//				var blockType;
//				$1.replace(/\s*\*\s*([^\r\n]+)/g, function($0, $1) {
//					var tag;
//					var line = $1.trim();
//					if (line === '') {
//						return;
//					}
//					lines.push(line);
//					if (line.match(/^@property \{Object\} options/)) {
//						blockType = 'options';
//					}
//					//else if ((tag = line.match(/^@(event|method|property)/))) {
//					else if ((tag = line.match(/^@(method|property)/))) {
//						blockType = tag[1];
//					}
//				});
//				if (blockType) {
//					docs[blockType].push( extract[blockType](lines) );
//				}
//			});
//			return docs;
//		},
//		method: function(lines) {
//			var method = {
//				params: []
//			};
//			lines.forEach(function(line) {
//				var match;
//				if ((match = line.match(/^@method\s+(.+)/))) {
//					method.name = match[1].trim();
//				}
//				else if ((match = line.match(/^@param \{(.+?)\} (\S+)(.*)$/))) {
//					method.params.push({
//						type: match[1],
//						name: match[2],
//						description: match[3].trim()
//					});
//				}
//				else if ((match = line.match(/^@return \{(.+?)\}(.*)$/))) {
//					method.returns = {
//						type: match[1],
//						description: (match[2] || '').trim()
//					};
//				}
//				else if ((match = line.match(/^@(\w+)(\s.+)?$/))) {
//					method[ match[1] ] = (match[2] || '').trim();
//				}
//				else {
//					method.description = line;
//				}
//			});
//			return method;
//		},
//		options: function(lines) {
//			return 'options!';
//		},
//		property: function(lines) {
//			// @property {Object} options
//			return lines;
//		},
//		event: function(lines) {
//			var event = {
//				cancelable: false,
//				whenCancelled: '',
//				params: []
//			};
//			lines.forEach(function(line) {
//				var match;
//				if ((match = line.match(/^@event\s+(.+)/))) {
//					event.name = match[1].trim();
//				}
//				else if ((match = line.match(/^@cancell?able(.*)/))) {
//					event.cancelable = true;
//					event.whenCancelled = match[1].trim();
//				}
//				else if ((match = line.match(/^@param \{(.+?)\} ([\w_]+)(.*)$/))) {
//					event.params.push({
//						type: match[1],
//						name: match[2],
//						description: match[3].trim()
//					});
//				}
//				else if ((match = line.match(/^@(\w+)(\s.+)?$/))) {
//					event[ match[1] ] = match[2];
//				}
//				else {
//					event.description = line;
//				}
//			});
//			return event;
//		}
//	};
	
//	function extractProperties(text) {
//		var props = [];
//		text.replace(/@param \{(.+?)\} ([\w_]+)([^\r\n]+)/g, function($0, $1, $2, $3) {
//			props.push({
//				type: $1,
//				name: $2,
//				description: $3.trim()
//			});
//		});
//		return props;
//	}
	
	function extractDocs(data) {
		var docs = {
			pkg: pkg,
			events: [],
			properties: [],
			methods: [],
			staticProperties: [],
			staticMethods: [],
			options: []
		};
		docs.constructor = data.classes.Suggester;
		data.classitems.sort(alphabetic).forEach(function(item) {
			if (item['class'] != 'Suggester') {
				return;
			}
			if (item.itemtype == 'property' && item.name == 'options') {
				docs.options = item.subprops;
			}
			else if (item.itemtype == 'method') docs.methods.push(item); 
			else if (item.itemtype == 'property') docs.properties.push(item); 
			else if (item['static'] && item.itemtype == 'method') docs.staticMethods.push(item); 
			else if (item['static'] && item.itemtype == 'property') docs.staticProperties.push(item); 
			else if (item.itemtype == 'event') docs.events.push(item); 
		});
		return docs;
	}
	
	function alphabetic(a, b) {
		if (!a.name || !b.name) {
			return 0;
		}
		var nameA = a.name.substring(0,1) == '_' ? 'zzz' + a.name : a.name;
		var nameB = b.name.substring(0,1) == '_' ? 'zzz' + b.name : b.name;
		return nameA == nameB ? 0 : (nameA > nameB ? 1 : -1);
	}
	
	grunt.registerTask('readme', 'Compile the README based on source documentation', function() {
		var tpl = grunt.file.read('src/README.md');
		var docData = extractDocs( grunt.file.readJSON('docs/data.json') );
//grunt.file.write('./test2.json', JSON.stringify(docData));
//return;
		var readme = grunt.template.process(tpl, {data:docData});
		grunt.file.write('./README.test.md', readme);
	})

	// Default task.
	grunt.registerTask('default', ['jshint', 'qunit', 'clean', 'copy', 'concat', 'cssmin', 'uglify', 'compress', 'yuidoc']);

};
