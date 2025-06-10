import fs from 'fs'
import { projects } from '../helper'
import prompts from 'prompts'
import picocolors from 'picocolors'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootPath = resolve(__dirname, '../')

const projectsList = projects.map(project => ({
  title: project.name,
  description: `[${project.prefix}-13845] title`,
  value: project.value
}))

const step_type = {
  type: 'autocomplete',
  name: 'set_default_project',
  message: 'Set default project prefix.',
  choices: projectsList,
  fallback: 'No matched project.'
} as const // TODO: Fix this type

export default async () => {
  let isCanceled = false
  const response = await prompts([step_type], {
    onSubmit: (prompt, answers) => {
      if (answers === undefined) {
        isCanceled = true
        return true
      }
    },
    onCancel: (prompt) => {
      isCanceled = true
      return false
    }
  })

  if (isCanceled) {
    console.log(picocolors.magenta(' init abort. '))
    return false
  }

  const { set_default_project } = response

  try {
    const filePath = resolve(rootPath, 'keep/cz_config.json')
    fs.writeFileSync(
      filePath,
      `${JSON.stringify({ defaultProject: set_default_project }, null, 2)}`
    )
    console.log(picocolors.green(` default project set: ${set_default_project} `))
  } catch (error) {
    console.log(picocolors.bgRed(picocolors.white(`init Fail: ${error}`)))
  }
}
