"use strict";

/**
 * search module (funcking ajax)
 * 
 * @function search
 * @param {Object} http - angular http object
 * @param {Object} scope - angular scope object
 * @param {Object} timeout - angular timeout object
 */
function search($http,$scope,$timeout) {

    $('#search').tooltip('hide');
    $('.alert').fadeOut();
    var ss = $scope.search;
    if (ss && angular.isString(ss)) {
        $('.modal').modal('show');
        $scope.versions = [];
        $scope.npm = {};
        $('.jumbotron').fadeOut();
        $http({
            method: 'GET',
            url: '/' + ss + '/',
            cache: true
        }).success(
                function(data,status,headers,config) {

                    $('.jumbotron').show(0);
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
                            link: 'https://www.npmjs.org/' + ss,
                            stat: 'http://npm-stat.com/charts.html?package='
                                    + ss,
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

                    for ( var i in data.versions) {
                        var v = data.versions[i];
                        var u, t;
                        if (v.repository && v.repository.url) {
                            u = v.repository.url;
                        }
                        if (v.dist && v.dist.tarball) {
                            t = v.dist.tarball;
                        }
                        try {
                            $scope.versions.push({
                                title: i,
                                time: new Date(data.time[i]).toUTCString(),
                                page: v.homepage,
                                repo: u,
                                url: t
                            });
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    $('.modal').modal('hide');
                    $('html,body').animate({
                        scrollTop: $('#show').position().top
                    },1200);
                    return;
                }).error(function(data,status,headers,config) {

            $('.alert').fadeIn(400,function() {

                $('.modal').modal('hide');
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
function controller($scope,$http,$timeout) {

    $scope.npm = {};
    $scope.versions = [];

    /*
     * binding
     */
    $('.alert').click(function() {

        $('.alert').fadeOut();
        return;
    });
    $(document).keypress(function(e) {

        if (e.which == 13) {
            $("#sub").click();
        }
        return;
    });
    $scope.button = function(item,event) {

        switch (item){
            case 'search':
                search($http,$scope,$timeout);
            break;
        }
    };
    return;
}

// load
var app = angular.module('supergiovane',[]);
app.controller('main',controller);
