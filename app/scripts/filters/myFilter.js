'use strict';

angular.module('textaposer')
  .filter('myFilter', function () {
    return function (input) {
      return 'myFilter filter: ' + input;
    };
  });
