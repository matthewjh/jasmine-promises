function initialise (files) {
  console.log(files);
}

initialise.$inject = ['config.files'];

module.exports = {
  'framework:jasmine-promises': ['factory', initialise]
};
