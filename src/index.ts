import cli from './commands'
import init from './commands/init'
import where from './commands/where'
import yargs from 'yargs/yargs'

type Args = {
  init?: boolean
  where?: boolean
}
export async function run(args: string[]): Promise<void> {
  const argv = yargs(args)
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
    .argv as Args

  if (argv.init) {
    await init()
  } else if (argv.where) {
    where()
  } else {
    cli()
  }
}
