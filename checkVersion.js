const { version } = require('./package.json');
const execa = require('execa')
const picocolors = require('picocolors')
const path = require('path');

const CACHE_FILE = path.join(__dirname, 'version_cache.json')

async function checkVersion () {
  try {
    // Check if the cache file exists
    if (!fs.existsSync(CACHE_FILE)) {
      // Create the cache file if it doesn't exist
      await createCacheFile()
    }

    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
    const { version: cacheVersion, timestamp } = cache
    let version = cacheVersion
    // cache for 7 day
    if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
      return
    }

    const latest = execa.sync('npm', ['view', 'OwlTing/cz', 'version']).stdout
    await updateCacheFile(latest)
    if (cacheVersion !== latest) {
      console.log(picocolors.gray(`🎉 owlting_cz v${latest} is available! please check the documentation for more information. (https://github.com/OwlTing/cz)`))
    }
  } catch (error) {
    // do nothing if failed
  }
}

async function createCacheFile () {
  const initialCacheData = { version: '', timestamp: 0 }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(initialCacheData))
}

async function updateCacheFile (version) {
  const cacheData = { version, timestamp: Date.now() }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData))
}

module.exports = checkVersion
