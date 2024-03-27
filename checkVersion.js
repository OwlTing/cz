const { version } = require('./package.json');
const execa = require('execa')
const picocolors = require('picocolors')

function checkVersion () {
  try {
    const latest = execa.sync('npm', ['view', 'OwlTing/cz', 'version']).stdout
    if (version !== latest) {
      console.log(picocolors.gray(`🎉 owlting_cz v${latest} is available! please check the documentation for more information. (https://github.com/OwlTing/cz)`))
    }
  } catch (error) {
    // do nothing if failed
  }
}

module.exports = checkVersion
