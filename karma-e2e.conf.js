/*jshint
    undef:false
*/

autoWatch = false;

basePath = '';

browsers = [
    'Chrome',
    'Firefox',
    'Safari'
];

captureTimeout = 20000;

colors = true;

exclude = [];

files = [
    ANGULAR_SCENARIO,
    ANGULAR_SCENARIO_ADAPTER,
    'test/angular-contenteditable-scenario.js',
    'test/e2e/**/*.js'
];

logLevel = LOG_INFO;

port = 9001;

proxies = {
    '/': 'http://dev.textaposer.com/'
};

reporters = ['progress'];

runnerPort = 9101;

singleRun = true;

urlRoot = '/_karma_/';
