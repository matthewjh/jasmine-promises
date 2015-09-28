module.exports = function (config) {
  require('./karma.conf')(config);

  var customLaunchers = {
    sl_chrome_35: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 7',
      version: '35'
    },
    sl_chrome_45: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'OS X 10.10',
      version: '45.0'
    },
    sl_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: '30'
    },
    sl_firefox_40: {
      base: 'SauceLabs',
      browserName: 'firefox',
      platform: 'OS X 10.10',
      version: '40.0'
    },
    sl_ie_11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11'
    },
    sl_ie_10: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 2012',
      version: '10'
    }
  };

  config.set({
    sauceLabs: {
      testName: 'jasmine-promise tests'
    },
    captureTimeout: 200000,
    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),
    reporters: ['dots', 'saucelabs'],
    singleRun: true
  });
}
