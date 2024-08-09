import prompts from 'prompts'
import execa from 'execa'
import { projects, commitTypes } from '../helper'
import picocolors from 'picocolors'
import fs from 'fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootPath = resolve(__dirname, '../')

let defaultProjectValue = ''

try {
  const filePath = resolve(rootPath, 'keep/cz_config.json')
  const config = fs.readFileSync(filePath)
  defaultProjectValue = JSON.parse(config as any).defaultProject
} catch (e) {
  console.log(picocolors.yellow(picocolors.italic(' 💡 You can try `cz -i` to choose a default project prefix. ')))
  defaultProjectValue = ''
}

const typesList = commitTypes.map(type => ({
  title: type.name,
  description: `${type.emoji} ${type.description}`,
  value: type.value,
  emoji: type.emoji
}))

const step_type = {
  type: 'autocomplete',
  name: 'commit_type',
  message: 'Pick a commit type.',
  choices: typesList,
  fallback: 'No matched type.'
}

const step_message = {
  type: 'text',
  name: 'commit_message',
  message: (prev: string) => {
    const target = typesList.find(type => type.value === prev)!
    return `${target.emoji} ${target.title}`
  },
  validate: (value: string) => {
    if (!value) {
      return 'Commit message is required.'
    }
    return true
  }
}

const step_description = {
  type: 'text',
  name: 'commit_description',
  message: 'Commit description (optional)',
  initial: '',
  validate: (value: string) => {
    if (value.length > 100) {
      return 'Description is too long.'
    }
    return true
  }
}

const step_is_jira = {
  type: 'confirm',
  name: 'is_jira',
  message: 'Tag Jira issue ?',
  initial: false
}

const projectsList = projects.map(project => ({
  title: project.name,
  description: `[${project.prefix}-13845] title`,
  value: project.value
}))

const defaultProject = projectsList.find(project => project.value === defaultProjectValue)!

const step_is_default_project = {
  type: (prev: boolean) => prev ? 'confirm' : null,
  name: 'is_default_project',
  message: `use '${defaultProject?.title}' pattern? e.g. ${defaultProject?.description}`,
  initial: true
}

const step_project_type = {
  type: (prev: string, { is_jira }: { is_jira: boolean }) => {
    return is_jira
      ? defaultProject?.value && prev
        ? null
        : 'autocomplete'
      : null
  },
  name: 'project_type',
  message: 'Pick a project type.',
  choices: projectsList,
  initial: 'owlpay',
  fallback: 'No matched project.'
}

const step_jira_id = {
  type: (prev: boolean) => prev ? 'number' : null,
  name: 'jira_id',
  message: 'Jira issue id',
  onRender () {
    (this as any).msg = picocolors.bgCyan(picocolors.white(' Jira issue ID ')) // TODO: fix type
  },
  validate: (value: number) => {
    if (!value) {
      return 'Jira issue ID is required.'
    }
    return true
  }
}

export default async () => {
  let isCanceled = false
  const order = [
    step_type,
    step_message,
    step_description,
    step_is_jira,
    defaultProject?.value ? step_is_default_project : null,
    step_project_type,
    step_jira_id
  ].filter(Boolean) as any // TODO: fix type
  const response = await prompts(order, {
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
    console.log(picocolors.magenta(' commit abort. '))
    return false
  }

  const { commit_type, commit_message, commit_description, is_jira, is_default_project, project_type, jira_id } = response
  const type = typesList.find(type => type.value === commit_type)!
  const commitTitle = `${type.emoji} ${commit_type}: ${commit_message}`
  const typeResponse = is_default_project ? defaultProject?.value : project_type
  const projectType = projects.find(project => project.value === typeResponse)!
  const result = is_jira
    ? `[${projectType.prefix}-${jira_id}] ${commitTitle}`
    : commitTitle

  try {
    const commands = commit_description ? ['commit', '-m', result, '-m', commit_description] : ['commit', '-m', result]
    const commitResult = await execa('git', commands)
    const branchHashName = commitResult.stdout.match(/\[(.*?)\]/)!.pop()!
    const [branchName, branchHash] = branchHashName.split(' ')
    console.log('-----------------------------------------------------------')
    console.log(picocolors.dim(commitResult.stdout))
    if (commitResult.stderr !== '') {
      console.log('-----------------------------------------------------------')
      console.log(picocolors.dim(commitResult.stderr))
    }
    console.log('-----------------------------------------------------------')
    console.log(`${picocolors.bgGreen(picocolors.bold(' Title       '))} ${picocolors.green(result)}`)
    if (commit_description) {
      console.log(`${picocolors.bgGreen(picocolors.bold(' Description '))} ${picocolors.green(commit_description)}`)
    }
    console.log(`${picocolors.bgGreen(picocolors.bold(' Commit hash '))} ${picocolors.bold(picocolors.cyan(` ${branchHash} `))} (${picocolors.italic(picocolors.green(branchName))})`)
  } catch (error: any) {
    console.log(picocolors.red(error.stderr))
    if (error.exitCode === 1) console.log(picocolors.bgRed(' No changes added to commit. '))
    else console.error(error)
  }
}
