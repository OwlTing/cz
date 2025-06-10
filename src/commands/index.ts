import prompts from 'prompts'
import execa from 'execa'
import { projects, commitTypes } from '../helper'
import type {
  ProjectConfig,
  CommitResponse,
  CommitResult,
  ProjectType,
  ParsedCommitResult
} from '../types'
import picocolors from 'picocolors'
import fs from 'fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootPath = resolve(__dirname, '../')

// Pure functions for business logic
export const loadProjectConfig = (filePath: string): ProjectConfig | null => {
  try {
    const config = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(config)
  } catch (e) {
    return null
  }
}

export const getDefaultProjectValue = (config: ProjectConfig | null): string => {
  return config?.defaultProject || ''
}

export const buildCommitTypesList = () => {
  return commitTypes.map(type => ({
    title: type.name,
    description: `${type.emoji} ${type.description}`,
    value: type.value,
    emoji: type.emoji
  }))
}

export const buildProjectsList = () => {
  return projects.map(project => ({
    title: project.name,
    description: `[${project.prefix}-13845] title`,
    value: project.value
  }))
}

export const findCommitType = (commitTypeValue: string) => {
  return commitTypes.find(type => type.value === commitTypeValue)
}

export const findProject = (projectValue: string): ProjectType | undefined => {
  return projects.find(project => project.value === projectValue)
}

export const buildCommitTitle = (commitType: string, message: string): string => {
  const type = findCommitType(commitType)
  if (!type) {
    throw new Error(`Invalid commit type: ${commitType}`)
  }
  return `${type.emoji} ${commitType}: ${message}`
}

export const buildFinalCommitMessage = (
  commitTitle: string,
  response: CommitResponse,
  defaultProjectValue: string
): string => {
  const { is_jira, is_default_project, project_type, jira_id } = response

  if (!is_jira) {
    return commitTitle
  }

  const typeResponse = is_default_project ? defaultProjectValue : project_type
  const projectType = findProject(typeResponse!)

  if (!projectType) {
    throw new Error(`Invalid project type: ${typeResponse}`)
  }

  if (!jira_id) {
    throw new Error('Jira ID is required when using Jira integration')
  }

  return `[${projectType.prefix}-${jira_id}] ${commitTitle}`
}

export const buildGitCommands = (commitMessage: string, description?: string): string[] => {
  if (description) {
    return ['commit', '-m', commitMessage, '-m', description]
  }
  return ['commit', '-m', commitMessage]
}

export const parseCommitResult = (stdout: string): ParsedCommitResult => {
  const branchHashName = stdout.match(/\[(.*?)\]/)?.pop()
  if (!branchHashName) {
    throw new Error('Could not parse commit result')
  }

  const [branchName, branchHash] = branchHashName.split(' ')
  return { branch: branchName, hash: branchHash }
}

// Step builders for better organization
export const buildPromptSteps = (defaultProjectValue: string, projectsList: any[], typesList: any[]) => {
  const defaultProject = projectsList.find(project => project.value === defaultProjectValue)

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
      (this as any).msg = picocolors.bgCyan(picocolors.white(' Jira issue ID '))
    },
    validate: (value: number) => {
      if (!value) {
        return 'Jira issue ID is required.'
      }
      return true
    }
  }

  return [
    step_type,
    step_message,
    step_description,
    step_is_jira,
    defaultProject?.value ? step_is_default_project : null,
    step_project_type,
    step_jira_id
  ].filter(Boolean)
}

// Side effect functions
export const showConfigMissingWarning = () => {
  console.log(picocolors.yellow(picocolors.italic(' 💡 You can try `cz -i` to choose a default project prefix. ')))
}

export const showCancelMessage = () => {
  console.log(picocolors.magenta(' commit abort. '))
}

export const showCommitResult = (result: CommitResult) => {
  console.log('-----------------------------------------------------------')
  console.log(`${picocolors.bgGreen(picocolors.bold(' Title       '))} ${picocolors.green(result.title)}`)
  if (result.description) {
    console.log(`${picocolors.bgGreen(picocolors.bold(' Description '))} ${picocolors.green(result.description)}`)
  }
  if (result.hash && result.branch) {
    console.log(`${picocolors.bgGreen(picocolors.bold(' Commit hash '))} ${picocolors.bold(picocolors.cyan(` ${result.hash} `))} (${picocolors.italic(picocolors.green(result.branch))})`)
  }
}

export const showGitOutput = (stdout: string, stderr?: string) => {
  console.log('-----------------------------------------------------------')
  console.log(picocolors.dim(stdout))
  if (stderr && stderr !== '') {
    console.log('-----------------------------------------------------------')
    console.log(picocolors.dim(stderr))
  }
  console.log('-----------------------------------------------------------')
}

export const showGitError = (error: any) => {
  console.log(picocolors.red(error.stderr))
  if (error.exitCode === 1) {
    console.log(picocolors.bgRed(' No changes added to commit. '))
  } else {
    console.error(error)
  }
}

// Main CLI function - orchestrates the flow
export default async () => {
  // Load configuration
  const configPath = resolve(rootPath, 'keep/cz_config.json')
  const config = loadProjectConfig(configPath)
  const defaultProjectValue = getDefaultProjectValue(config)

  if (!config) {
    showConfigMissingWarning()
  }

  // Build choices
  const typesList = buildCommitTypesList()
  const projectsList = buildProjectsList()
  const steps = buildPromptSteps(defaultProjectValue, projectsList, typesList)

  // Handle user input
  let isCanceled = false
  const response = await prompts(steps as any, {
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
  }) as CommitResponse

  if (isCanceled) {
    showCancelMessage()
    return false
  }

  try {
    // Build commit message
    const commitTitle = buildCommitTitle(response.commit_type, response.commit_message)
    const finalCommitMessage = buildFinalCommitMessage(commitTitle, response, defaultProjectValue)
    const gitCommands = buildGitCommands(finalCommitMessage, response.commit_description)

    // Execute git commit
    const commitResult = await execa('git', gitCommands)
    const { branch, hash } = parseCommitResult(commitResult.stdout)

    // Show results
    showGitOutput(commitResult.stdout, commitResult.stderr)
    showCommitResult({
      title: finalCommitMessage,
      description: response.commit_description,
      hash,
      branch
    })

    return true
  } catch (error: any) {
    showGitError(error)
    return false
  }
}
