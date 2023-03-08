
module.exports = {
  build: require('#Build'),
  clean: require('#Helpers/functions/dist-clean.js'),
  convert: require('#Convert'),
  dev: require('#Helpers/functions/dev.js'),
  ignore: require('#Helpers/functions/theme-ignore.js'),
  import: require('#Import'),
  init: require('#Init'),
  new: require('#Helpers/functions/scaffold-new.js'),
  'pull-json': require('#Helpers/functions/pull-json.js'),
}
