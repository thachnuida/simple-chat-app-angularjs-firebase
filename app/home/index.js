'use strict';

angular.module('myApp.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'home/home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', ['$scope', '$location', function($scope, $location) {

  function generateUID() {
    return ("0000" + (new Date().getTime() * Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-6)
  };

  $scope.createChatRoom = function() {
    var chatID = generateUID();
    $location.url('/chat/' + chatID);
  };
}]);