var app = angular.module('supergiovane', []);

/**
 * up function
 * 
 * @function up
 * @return {Boolen}
 */
function up() {

  'use strict';

  $('html,body').animate({
    scrollTop: $('.search').position().top
  }, 1200, 'swing', function() {

    $('#search').focus();
    return;
  });
  return false;
}

function error() {

  $('.jumbotron').fadeOut(400);
  $('.alert').fadeIn(400, function() {

    $('.modal').modal('hide');
    $('html,body').animate({
      scrollTop: $('.alert').position().top
    }, 1200);
  });
}

/**
 * search module (funcking ajax)
 * 
 * @function search
 * @param {Object} http - angular http object
 * @param {Object} scope - angular scope object
 */
function search($http, $scope) {

  'use strict';

  $('#search').tooltip('hide');
  $scope.clean(false);
  $scope.versions = [];

  var ss = $scope.search;
  var searchedRegex = /^([^@]*)/;

  if (ss && angular.isString(ss)) {
    $('.modal').modal('show');
    $http({
      method: 'GET',
      url: '/api/' + ss.replace(/@/, '/') + '/',
      cache: true
    }).then(function success(res) {

      var data = res.data;
      if (data === '') { // empty response
        return error();
      }
      $scope.searched = ss.match(searchedRegex)[0];

      try {
        var author = Object.create(null);
        if (data.author && data.author.name) {
          author = {
            name: data.author.name,
            url: data.author.url,
            email: data.author.email,
            stat: 'http://npm-stat.com/charts.html?author=' + data.author.name,
          };
        }
        var npm = {
          link: 'https://www.npmjs.com/package/' + $scope.searched,
          stat: 'http://npm-stat.com/charts.html?package=' + $scope.searched,
        };
        if (data.bugs && data.bugs.url) {
          npm.issue = data.bugs.url;
        }
        $scope.npm = {
          desc: data.description,
          author: author,
          npm: npm,
          license: data.license
        };
      } catch (e) {
        $scope.npm = Object.create(null);
        console.error(e);
      }

      var ii = 0;
      var versions;
      try {
        if (data.versions) {
          versions = Object.keys(data.versions);
          ii = ~~versions.length;
          $scope.npm.versions = ii;
          $scope.class = 'col-6 col-sm-6 col-lg-4';
        } else {
          $scope.npm.versions = 1;
          $scope.class = 'col-8 col-sm-8 col-lg-12';
        }

        if (ii > 0) { // multiple
          var scopeVersions = [];
          for (var i = 0; i < ii; ++i) {
            var version = data.versions[versions[i]];
            var url, tarball;

            if (version.repository && version.repository.url) {
              url = version.repository.url;
            }
            if (version.dist && version.dist.tarball) {
              tarball = version.dist.tarball;
            }

            scopeVersions[i] = {
              id: version._id,
              title: version.version,
              npmv: version._npmVersion,
              time: new Date(data.time[version.version]).toUTCString(),
              page: version.homepage,
              repo: url,
              url: tarball
            };
          }
          $scope.versions = scopeVersions.reverse();

        } else { // single
          var url, tarball, node;
          var depsN = [];
          var depsV = [];

          if (data.repository && data.repository.url) {
            url = data.repository.url;
          }
          if (data.dist && data.dist.tarball) {
            tarball = data.dist.tarball;
          }
          if (data.engines && data.engines.node) {
            node = data.engines.node;
          }
          if (data.dependencies) {
            var deps = Object.keys(data.dependencies);
            for (var i = 0, ii = deps.length; i < ii; ++i) {
              var dep = deps[i];
              depsN[i] = {
                title: dep,
                url: 'https://www.npmjs.com/package/' + dep,
                version: data.dependencies[dep]
              };
            }
          }
          if (data.devDependencies) {
            var deps = Object.keys(data.devDependencies);
            for (var i = 0, ii = deps.length; i < ii; ++i) {
              var dep = deps[i];
              depsV[i] = {
                title: dep,
                url: 'https://www.npmjs.com/package/' + dep,
                version: data.devDependencies[dep]
              };
            }
          }

          $scope.versions[0] = {
            id: data._id,
            title: data.version,
            npmv: data._npmVersion,
            page: data.homepage,
            repo: url,
            url: tarball,
            node: node,
            depsN: depsN,
            depsV: depsV
          };
        }
      } catch (e) {
        console.error(e);
      }

      $scope.$watch($scope.versions, function() { // wait renderer

        if (ii === 0) { // single, and show versions badge
          $('.col-6').css('width', '100%');
        }
        $('.jumbotron').show(400);
        $('.modal').modal('hide');
        $('html,body').animate({
          scrollTop: $('#show').position().top
        }, 1200);
      });

    }, error);

  } else {
    $('#search').tooltip('show');
  }
}

/**
 * angular controller
 * 
 * @function controller
 * @param {Object} http - angular http object
 * @param {Object} scope - angular scope object
 * @param {Object} timeout - angular timeout object
 */
app.controller('main', [
  '$scope',
  '$http',
  '$location',
  function($scope, $http, $location) {

    'use strict';

    $scope.perPage = 60;
    $scope.$on('$locationChangeSuccess', function() {

      $scope.search = $location.path().substring(1).replace(/\/$/, '').replace(
        /\//, '@');
      search($http, $scope);
    });

    /**
     * clean previous results
     * 
     * @function $scope.clean
     * @param boolean [force] force scope search clean
     */
    $scope.clean = function(force) {

      $('.alert').fadeOut();
      $('.col-6').fadeOut(400, function() {

        $scope.npm = Object.create(null);
        $scope.versions = [];
        if (force) {
          $scope.search = '';
        }
        return;
      });
      return;
    };

    /*
     * key binding
     */
    $('.alert').click(function() {

      return $('.alert').fadeOut();
    });
    $(document).keypress(function(e) {

      if (e.which === 13) {
        $('#sub').click();
      }
      return;
    });
    $scope.button = function(item) {

      switch (item) {
        case 'search':
          $location.path($scope.search.replace(/@/, '/'));
          break;
        case 'clear':
          $scope.clean(true);
          $('.jumbotron').fadeOut(400);
          $('#search').val('');
          $('#search').focus();
          break;
      }
    };
  } ]);

// load
$('#search').focus();
