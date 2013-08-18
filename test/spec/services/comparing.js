'use strict';

describe('Service: comparingService', function () {

  // load the service's module
  beforeEach(module('textaposer'));

  // instantiate service
  var comparingService;
  beforeEach(inject(function (_comparingService_) {
    comparingService = _comparingService_;
  }));

  it('should do something', function () {
    expect(!!comparingService).toBe(true);
  });

});
