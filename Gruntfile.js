'use strict';
/**
 * @file gruntfile
 * @subpackage main
 * @version 0.0.1
 * @author hex7c0 <hex7c0@gmail.com>
 * @copyright hex7c0 2014
 * @license GPLv3
 */

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*\n' + ' * <%= pkg.name %> v<%= pkg.version %>\n'
      + ' * (c) <%= pkg.author.name %> <%= pkg.homepage %>\n'
      + ' * Licensed under <%= pkg.license %>\n' + ' */\n',

    clean: [ 'index.min.js', 'min/**/*', 'public/**/*.min.*' ],

    uglify: {
      target: {
        options: {
          mangle: false,
          beautify: true
        },
        files: [ {
          expand: true,
          src: 'lib/**/*.js',
          dest: 'min'
        }, {
          expand: true,
          src: 'module/**/*.js',
          dest: 'min'
        }, {
          'index.min.js': 'index.js'
        } ]
      },
      script: {
        options: {
          mangle: false,
          banner: '<%= banner %>'
        },
        files: {
          'public/js/script.min.js': 'public/js/script.js'
        }
      }
    },

    cssmin: {
      css: {
        options: {
          banner: '<%= banner %>'
        },
        files: {
          'public/css/style.min.css': 'public/css/style.css'
        }
      }
    },

    htmlmin: {
      html: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          minifyJS: true,
          minifyCSS: true
        },
        files: {
          'public/index.min.html': 'public/index.html'
        }
      }
    },

    jshint: {
      options: {
        curly: true,
        indent: 2,
        quotmark: 'single',
        undef: true,
        unused: true,
        strict: true,
        node: true,
        // relax
        laxbreak: true,
        loopfunc: true,
        shadow: true
      },
      target: {
        src: [ 'lib/**/*.js', 'module/**/*.js', 'index.js' ]
      },
      web: {
        options: {
          // override
          unused: false,
          strict: false,
          node: false,
          // web
          predef: [ 'angular', 'console' ],
          browser: true,
          jquery: true
        },
        files: {
          src: 'public/js/script.js'
        }
      }
    },

    shell: {
      options: {
        failOnError: false
      },
      docs: {
        command: 'jsdoc ./lib/*.js ./module/*.js -c .jsdoc.json'
      }
    },

    endline: {
      target: {
        options: {
          except: [ 'node_modules', 'bower_components' ],
          replaced: true
        },
        files: [ {
          src: './**/*.js'
        }, {
          src: './**/*.css'
        }, {
          src: './**/*.html'
        } ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-endline');

  grunt.registerTask('lint', [ 'jshint' ]);
  grunt.registerTask('html', [ 'cssmin', 'htmlmin' ]);
  grunt.registerTask('min', [ 'clean', 'html', 'uglify', 'endline' ]);
  grunt.registerTask('default', [ 'lint', 'min' ]);

  return;
};
