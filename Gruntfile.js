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
					archive: 'DOWNLOAD.zip'
				},
				files: [
					{
						src: ['dist/*'], 
						dest: './',
						flatten: true,
						filter: 'isFile'
					}
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
	
	// custom tasks	
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
		var readme = grunt.template.process(tpl, {data:docData});
		grunt.file.write('./README.md', readme);
	})

	// Default task.
	grunt.registerTask('default', ['jshint', 'qunit', 'clean', 'copy', 'concat', 'cssmin', 'uglify', 'compress', 'yuidoc', 'readme']);

};
