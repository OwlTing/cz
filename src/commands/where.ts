import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
export default () => {
  console.log(`Your config will be saved in ${__dirname}.`)
}
