#!/usr/bin/env node
const cli = require('./cli')
const init = require('./cz_init')
const where = require('./cz_where')

const yargs = require('yargs/yargs')
const args = yargs(process.argv.slice(2))
  .options({
    'init': {
      alias: 'i',
      describe: 'Set default project prefix.'
    },
    'where': {
      alias: 'w',
      describe: 'Show config file path.'
    }
  })
  .help()
  .argv

if (args.init) {
  init()
} else if (args.where) {
  where()
} else {
  cli()
}
