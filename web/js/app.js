var app = angular.module("sampleApp", ["firebase"]);
app.controller("SampleCtrl", function($scope, $firebaseAuth, $firebaseArray) {
  var warscrollsRef = firebase.database().ref('/warscrolls');
  var unitTypesRef = firebase.database().ref('/unit-types');

  var auth = $firebaseAuth();

  $scope.doLogin = function() {
    auth.$signInWithPopup("google").then(function(firebaseUser) {
        $scope.warscrolls = $firebaseArray(warscrollsRef);
        $scope.currentUser = firebaseUser;
        $scope.unitTypes = $firebaseArray(unitTypesRef);
      }).catch(function(error) {
        console.log("Authentication failed:", error);
      });
  };

  $scope.selectWarscroll = function(warscroll) {
    $scope.selectedWarscroll = warscroll;
    $('#warscrollModal').modal('show');
  };
});