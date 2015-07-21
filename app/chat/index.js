'use strict';

function fakeNgModel(initValue){
  return {
    $setViewValue: function(value){
      this.$viewValue = value;
    },
    $viewValue: initValue
  };
}

angular.module('myApp.chat', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/chat/:chatID', {
    templateUrl: 'chat/chat.html',
    controller: 'ChatCtrl'
  });
}])

.controller('ChatCtrl', [
  '$scope', '$routeParams', '$firebaseArray', '$firebaseObject', '$location',
  function($scope, $routeParams, $firebaseArray, $firebaseObject, $location) {
    var chatID = $routeParams.chatID;
    var fbUrl = 'https://im-saysua.firebaseio.com/';
    var RoomMembersRef = new Firebase(fbUrl + 'members/' + chatID);
    var roomMembers = $firebaseArray(RoomMembersRef);
    var RoomMessagesRef = new Firebase(fbUrl + 'messages/' + chatID);
    var roomMessages;
    var currentUser;

    $scope.readyToChat = false;
    $scope.messageBody = {value: ''};

    // Verify room is available
    roomMembers.$loaded().then(function() {
      console.log('loaded record', roomMembers);
      if (roomMembers.length >= 2) {
        alert('Room is full!');
        $location.url('/');
      };
      $scope.roomMembers = roomMembers;

      // Get room messages
      $scope.roomMessages = $firebaseArray(RoomMessagesRef);

      $scope.readyToChat = false;
    });


    $scope.username = '';

    $scope.setUsername = function(username) {
      $scope.username = username;
      roomMembers.$add($scope.username).then(function(ref) {
        currentUser = ref;
        $scope.readyToChat = true;
        console.log($scope.roomMembers.length);
      });
    };

    $scope.addMessage = function(message) {
      $scope.roomMessages.$add({user: $scope.username, body: message, createdAt: Firebase.ServerValue.TIMESTAMP});
      $scope.messageBody.value = '';
    };

    // Leave room on firebase
    function leaveRoom() {
      if (currentUser) {
        roomMembers.$remove(roomMembers.$indexFor(currentUser.key()));
      }
    };

    window.addEventListener('unload', leaveRoom);

    $scope.$on('$destroy', function() {
      window.removeEventListener('unload', leaveRoom);
      leaveRoom();
    });
}])

.directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind('keydown keypress', function (event) {
        if(event.which === 13) {
            scope.$apply(function (){
                scope.$eval(attrs.ngEnter);
            });

            event.preventDefault();
        }
    });
  };
})

.directive('scrollGlue', function(){
  return {
    priority: 1,
    require: ['?ngModel'],
    restrict: 'A',
    link: function(scope, $el, attrs, ctrls){
      var el = $el[0],
        ngModel = ctrls[0] || fakeNgModel(true);

      function scrollToBottom(){
        el.scrollTop = el.scrollHeight;
      }

      function shouldActivateAutoScroll(){
        // + 1 catches off by one errors in chrome
        return el.scrollTop + el.clientHeight + 1 >= el.scrollHeight;
      }

      scope.$watch(function(){
        if(ngModel.$viewValue){
            scrollToBottom();
        }
      });

      $el.bind('scroll', function(){
        scope.$apply(ngModel.$setViewValue.bind(ngModel, shouldActivateAutoScroll()));
      });
    }
  };
});
