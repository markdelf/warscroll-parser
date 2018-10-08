var app = angular.module("warscrollsApp", ["firebase", 'localytics.directives']);
app.controller("MainCtrl", function($scope, $firebaseAuth, $firebaseArray, $window, $filter) {
  var warscrollsRef = firebase.database().ref('/warscrolls');
  var unitTypesRef = firebase.database().ref('/unit-types');

  $scope.searchText = '';
  var auth = $firebaseAuth();

  $scope.doLogin = function() {
    auth.$signInWithPopup("google").then(function(firebaseUser) {
        $scope.warscrolls = $firebaseArray(warscrollsRef);
        $scope.filteredWarscrolls = $scope.warscrolls;
        $scope.currentUser = firebaseUser;
        $scope.unitTypes = $firebaseArray(unitTypesRef);
      }).catch(function(error) {
        console.log("Authentication failed:", error);
      });
  };

   var getAllKeywords = function(){
    var allKeywords = [];
    for(var i = 0; i < $scope.warscrolls.length; i++) {
          var scroll = $scope.warscrolls[i];
          console.log(i);
          for(var k in scroll.keywords) {
              var keyword = scroll.keywords[k];
              if(allKeywords.indexOf(keyword) < 0) {
                allKeywords.push(keyword);
              }
          }
        }
      return allKeywords;
  }

  $scope.addKeyword = function(term) {
    $scope.$apply(function() {
      if ($scope.allKeywords.indexOf(term) < 0) {
        $scope.allKeywords.push(term);
        $scope.selectedWarscroll.keywords.push(term);
      }
    });
  }

  $scope.filterWarscrolls = function(text) {
    var results = $filter('filter')($scope.warscrolls, text);
    $scope.filteredWarscrolls = results;
  }

  $scope.selectWarscroll = function(warscroll) {
    if (!$scope.allKeywords) {
        $scope.allKeywords = getAllKeywords();
    }
    $scope.selectedWarscroll = warscroll;
    $('#warscrollModal').modal('show');
  };

  $scope.showNext = function() {
    var pos = $scope.filteredWarscrolls.indexOf($scope.selectedWarscroll);
    var next = pos + 1;
    if (next >= $scope.filteredWarscrolls.length) {
        next = 0;
    }
    $scope.selectedWarscroll = $scope.filteredWarscrolls[next];
    $window.scrollTo(0, 0);
  }

  $scope.showPrev = function() {
    var pos = $scope.filteredWarscrolls.indexOf($scope.selectedWarscroll);
    var prev = pos - 1;
    if (prev < 0) {
        prev = $scope.filteredWarscrolls.length - 1;
    }
    $scope.selectedWarscroll = $scope.filteredWarscrolls[prev];
    $window.scrollTo(0, 0);
  }

  $scope.doLogin();
});