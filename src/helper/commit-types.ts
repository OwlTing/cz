import type { CommitType } from '../types'

export type { CommitType }

export default <CommitType[]>[
  {
    name: 'chore',
    emoji: '🧹',
    description: 'Build process or auxiliary tool changes',
    value: 'chore'
  },
  {
    name: 'ci',
    emoji: '👷',
    description: 'CI related changes',
    value: 'ci'
  },
  {
    name: 'docs',
    emoji: '📝',
    description: 'Documentation only changes',
    value: 'docs'
  },
  {
    name: 'feat',
    emoji: '💡',
    description: 'A new feature',
    value: 'feat'
  },
  {
    name: 'fix',
    emoji: '🐛',
    description: 'A bug fix',
    value: 'fix'
  },
  {
    name: 'hotfix',
    emoji: '🚨',
    description: 'Emergency fix',
    value: 'hotfix'
  },
  {
    name: 'perf',
    emoji: '⚡',
    description: 'A code change that improves performance',
    value: 'perf'
  },
  {
    name: 'refactor',
    emoji: '🔨',
    description: 'A code change that neither fixes a bug or adds a feature',
    value: 'refactor'
  },
  {
    name: 'release',
    emoji: '🎉',
    description: 'Create a release commit',
    value: 'release'
  },
  {
    name: 'style',
    emoji: '🎨',
    description: 'Markup, white-space, formatting, missing semi-colons...',
    value: 'style'
  },
  {
    name: 'test',
    emoji: '🎮',
    description: 'Adding missing tests',
    value: 'test'
  },
  {
    name: 'storybook',
    emoji: '📚',
    description: 'New storybook',
    value: 'storybook'
  },
  {
    name: 'revert',
    emoji: '🔙',
    description: 'Revert a commit',
    value: 'revert'
  }
]
