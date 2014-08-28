"use strict";

/**
 * up function
 * 
 * @function up
 * @return {Boolen}
 */
function up() {

    $('html,body').animate({
        scrollTop: $('.search').position().top
    }, 1200, 'swing', function() {

        $('#search').focus();
        return;
    });
    return false;
}

/**
 * search module (funcking ajax)
 * 
 * @function search
 * @param {Object} http - angular http object
 * @param {Object} scope - angular scope object
 */
function search($http, $scope) {

    $('#search').tooltip('hide');
    $scope.clean();
    // $scope.npm = Object.create(null);
    $scope.versions = [];
    var ss = $scope.search;
    if (ss && angular.isString(ss)) {
        $('.modal').modal('show');
        $http({
            method: 'GET',
            url: '/' + ss.replace(/@/, '/') + '/',
            cache: true
        }).success(
                function(data, status, headers, config) {

                    $('.jumbotron').show();
                    $scope.searched = ss.match(/^([^@]*)/)[0];
                    try {
                        var a;
                        if (data.author && data.author.name) {
                            a = {
                                name: data.author.name,
                                url: data.author.url,
                                email: data.author.email,
                                stat: 'http://npm-stat.com/charts.html?author='
                                        + data.author.name,
                            };
                        }
                        var n = {
                            link: 'https://www.npmjs.org/' + $scope.searched,
                            stat: 'http://npm-stat.com/charts.html?package='
                                    + $scope.searched,
                        };
                        if (data.bugs && data.bugs.url) {
                            n.issue = data.bugs.url;
                        }
                        $scope.npm = {
                            desc: data.description,
                            author: a,
                            npm: n,
                            license: data.license
                        };
                    } catch (e) {
                        console.error(e);
                    }

                    var c = 0;
                    try {
                        for ( var i in data.versions) { // multiple
                            var v = data.versions[i];
                            var u, t;
                            if (v.repository && v.repository.url) {
                                u = v.repository.url;
                            }
                            if (v.dist && v.dist.tarball) {
                                t = v.dist.tarball;
                            }
                            $scope.versions.push({
                                title: i,
                                npmv: v._npmVersion,
                                time: new Date(data.time[i]).toUTCString(),
                                page: v.homepage,
                                repo: u,
                                url: t
                            });
                            c++;
                        }
                        if (c === 0) { // single
                            var u, t;
                            if (data.repository && data.repository.url) {
                                u = data.repository.url;
                            }
                            if (data.dist && data.dist.tarball) {
                                t = data.dist.tarball;
                            }
                            var dep = '', depv = '';
                            if (data.dependencies) {
                                for ( var i in data.dependencies) {
                                    dep += 'https://www.npmjs.org/package/' + i + ' @'
                                            + data.dependencies[i] + ' ';
                                }
                            }
                            if (data.devDependencies) {
                                for ( var i in data.devDependencies) {
                                    depv += 'https://www.npmjs.org/package/' + i + ' @'
                                            + data.devDependencies[i] + ' ';
                                }
                            }
                            var node;
                            if (data.engines && data.engines.node) {
                                node = data.engines.node;
                            }
                            $scope.versions[0] = {
                                title: data.version,
                                npmv: data._npmVersion,
                                node: node,
                                dep: dep,
                                depv: depv,
                                page: data.homepage,
                                repo: u,
                                url: t
                            };
                        }
                        $scope.npm.versions = 1;
                    } catch (e) {
                        console.error(e);
                    }

                    $scope.$watch($scope.versions, function() { // wait renderir

                        $('.modal').modal('hide');
                        if (c === 0) { // single, and show versions badge
                            $('.col-6').css('width', '100%');
                        }
                        $('html,body').animate({
                            scrollTop: $('#show').position().top
                        }, 1200);
                    });
                    return;
                }).error(function(data, status, headers, config) {

            $('.jumbotron').fadeOut(400, function() {

                $('.alert').fadeIn(400, function() {

                    $('.modal').modal('hide');
                    $('html,body').animate({
                        scrollTop: $('.alert').position().top
                    }, 1200);
                    return;
                });
                return;
            });
        });
    } else {
        $('#search').tooltip('show');
    }
    return;
}

/**
 * angular controller
 * 
 * @function controller
 * @param {Object} http - angular http object
 * @param {Object} scope - angular scope object
 * @param {Object} timeout - angular timeout object
 */
function controller($scope, $http, $location) {

    $scope.npm = Object.create(null);
    $scope.$on('$locationChangeSuccess', function(event) {

        $scope.search = $location.path().substring(1).replace(/\/$/, '').replace(/\//,
                '@');
        search($http, $scope);
    });
    /**
     * clean previous results
     * 
     * @function $scope.clean
     */
    $scope.clean = function() {

        $('.alert').fadeOut();
        $('.col-6').fadeOut(400, function() {

            $('.jumbotron').fadeOut(400, function() {

                // $scope.npm = Object.create(null);
                $scope.versions = [];
                return;
            });
            return;
        });
        return;
    };

    /*
     * key binding
     */
    $('.alert').click(function() {

        $('.alert').fadeOut();
        return;
    });
    $(document).keypress(function(e) {

        if (e.which === 13) {
            $("#sub").click();
        }
        return;
    });
    $scope.button = function(item, event) {

        switch (item) {
            case 'search':
                search($http, $scope);
                break;
            case 'clear':
                $scope.clean();
                $('#search').val('');
                $('#search').focus();
                break;
        }
    };
    return;
}

// load
var app = angular.module('supergiovane', [ 'ngSanitize' ]);
app.controller('main', controller);
$('#search').focus();
