var app = angular.module("sampleApp", ["firebase"]);
app.controller("SampleCtrl", function($scope, $firebaseAuth, $firebaseArray) {
  var ref = firebase.database().ref();

  var auth = $firebaseAuth();

  $scope.doLogin = function() {
    auth.$signInWithPopup("google").then(function(firebaseUser) {
        $scope.warscrolls = $firebaseArray(ref);
        $scope.currentUser = firebaseUser;
      }).catch(function(error) {
        console.log("Authentication failed:", error);
      });
  };
});