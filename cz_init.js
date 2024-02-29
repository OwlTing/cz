#!/usr/bin/env node
const fs = require('fs')
const projects = require('./projects')
const prompts = require('prompts')
const picocolors = require('picocolors')

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
}

module.exports = async () => {
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
    fs.writeFileSync(
      `${__dirname}/cz_config.json`,
      `${JSON.stringify({ defaultProject: set_default_project } || {}, null, 2)}`,
    )
    console.log(picocolors.green(` default project set: ${set_default_project} `))
  } catch (error) {
    console.log(picocolors.bgRed.white(' init Fail ', error))
  }
}
