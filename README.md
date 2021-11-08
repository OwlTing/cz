# create commit
create commit in human way.

~~only apply for OWLPAY currently~~

## Install
```shell
# npm
npm install -g unickowl/cz

# yarn
yarn add global unickowl/cz

#pnpm
pnpm install -g unickowl/cz
```
> requires node ^14

## Usage
```shell
cz
```

## Types

```
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
}
```

## Todo

- [ ] adapt for other projects prefix
