// Configuration related types
export interface ProjectConfig {
  defaultProject?: string
}

// CLI response types
export interface CommitResponse {
  commit_type: string
  commit_message: string
  commit_description?: string
  is_jira: boolean
  is_default_project?: boolean
  project_type?: string
  jira_id?: number
}

// Result display types
export interface CommitResult {
  title: string
  description?: string
  hash?: string
  branch?: string
}

// Project structure types
export interface ProjectType {
  name: string
  prefix: string
  value: string
}

// Commit type structure
export interface CommitType {
  name: string
  emoji: string
  description: string
  value: string
}

// Git command result types
export interface GitCommitResult {
  stdout: string
  stderr?: string
}

export interface ParsedCommitResult {
  branch: string
  hash: string
}

// Error types
export interface GitError extends Error {
  stderr?: string
  exitCode?: number
}

// Prompt step types
export interface PromptChoice {
  title: string
  description: string
  value: string
  emoji?: string
}

export interface PromptStep {
  type: string
  name: string
  message: string | ((prev: any) => string)
  choices?: PromptChoice[]
  initial?: any
  validate?: (value: any) => boolean | string
  fallback?: string
  onRender?: () => void
} 