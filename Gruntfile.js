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
					paths: 'src/',
					outdir: 'docs/',
					parseOnly: false
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

	// Default task.
	grunt.registerTask('default', ['jshint', 'qunit', 'clean', 'copy', 'concat', 'cssmin', 'uglify', 'compress', 'yuidoc']);

};
