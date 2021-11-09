# create commit
![](https://img.shields.io/badge/node-%5E14-brightgreen.svg)

create commit in human way.

~~only apply for OWLPAY currently~~

## Install
```shell
# npm
npm install -g OwlTing/cz

# yarn
yarn add global OwlTing/cz

#pnpm
pnpm install -g OwlTing/cz
```

## Usage
```shell
cz
```
### Step 1
pick a commit type

![image](https://user-images.githubusercontent.com/45550113/140848819-8b115e2b-3972-433d-8ae8-f8a4925c0f1d.png)

### Step 2
commit message

![image](https://user-images.githubusercontent.com/45550113/140848900-98233775-7707-48af-917b-ccff016b63ff.png)

### Step 3
if need to tag Jira issue for title prefix

![image](https://user-images.githubusercontent.com/45550113/140849139-c77c6a4b-695e-40b3-8951-35ab81e6b242.png)

### Step 4 (if !!Step3)
input Jira issue ID

![image](https://user-images.githubusercontent.com/45550113/140849306-ed60d5b1-cf15-4be5-801e-2dd186408ac9.png)


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
- [ ] unit test
