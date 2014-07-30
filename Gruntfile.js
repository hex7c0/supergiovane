"use strict";
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

        clean: ['index.min.js','min/**/*.js','public/monitode*.*'],

        uglify: {
            options: {
                preserveComments: 'false',
                banner: '<%= banner %>',
            },
            target: {
                files: [{
                    expand: true,
                    src: 'lib/*.js',
                    dest: 'min'
                },{
                    expand: true,
                    src: 'module/*.js',
                    dest: 'min'
                },{
                    'index.min.js': 'index.js',
                    'public/script.min.js': 'public/script.js'
                }]
            }
        },

        cssmin: {
            css: {
                options: {
                    banner: '<%= banner %>'
                },
                files: {
                    'public/style.min.css': 'public/style.css'
                }
            }
        },

        htmlmin: {
            html: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'public/index.min.html': 'public/index.html'
                }
            }
        },

        shell: {
            options: {
                failOnError: false
            },
            docs: {
                command: "jsdoc ./lib/*.js ./module/*.js -c .jsdoc.json"
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('html',['cssmin','htmlmin']);
    grunt.registerTask('min',['clean','html','uglify']);
    grunt.registerTask('doc',['shell']);
    grunt.registerTask('default',['min','doc']);

};
