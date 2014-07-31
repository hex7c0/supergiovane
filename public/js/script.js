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

        $http({
            method: 'GET',
            url: '/' + ss + '/',
            cache: true
        }).success(function(data,status,headers,config) {

            $('.jumbotron').show(0);
            try {
                var a;
                if (data.author && data.author.name) {
                    a = data.author;
                }
                $scope.npm = {
                    desc: data.description,
                    author: a.name,
                    web: a.url,
                    email: a.email,
                    npm: 'https://www.npmjs.org/' + ss,
                    stat: 'http://npm-stat.com/charts.html?package=' + ss,
                    issue: data.bugs.url,
                    license: data.license
                };
            } catch (e) {
                console.error(e);
            }

            $scope.versions = [];
            for ( var i in data.versions) {
                var v = data.versions[i];
                var u;
                if (v.repository && v.repository.url) {
                    u = v.repository.url;
                }
                try {
                    $scope.versions.push({
                        title: i,
                        time: new Date(data.time[i]).toUTCString(),
                        page: v.homepage,
                        repo: u,
                        url: v.dist.tarball
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

            $('.alert').fadeIn(function() {

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
