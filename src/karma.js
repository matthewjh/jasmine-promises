var path = require('path');
var loadPath =  path.resolve(__dirname, './index.js');

function createPattern (path) {
  return {pattern: path, included: true, served: true, watched: false};
}

function initialise (files) {
  files.unshift(createPattern(loadPath));
}

initialise.$inject = ['config.files'];

module.exports = {
  'framework:jasmine-promises': ['factory', initialise]
};
