# create commit
![](https://img.shields.io/badge/node-%5E14-brightgreen.svg)

create commit in human way.

## Install
```shell
# npm
npm install -g OwlTing/cz

# yarn
yarn global add OwlTing/cz

# pnpm
pnpm install -g OwlTing/cz

# bun
bun install -g OwlTing/cz
```

> Add `export PATH="$(yarn global bin):$PATH"` to your `~./zshrc` if you installed it by yarn global

## Update version
```shell
# npm
npm update -g owlting_cz

# yarn
yarn global upgrade owlting_cz

# pnpm
pnpm update -g owlting_cz

# bun
bun update -g owlting_cz
```

## Uninstall
```shell
# npm
npm uninstall -g owlting_cz

# yarn
yarn global remove owlting_cz

# pnpm
pnpm uninstall -g owlting_cz

# bun
bun remove -g owlting_cz
```

## Commands
```shell
cz [Options]
```
```shell
Options:
      --version  Show version number
  -i, --init     Set default project prefix.
  -w, --where    Show config file path.
      --help     Show help
```

## Usage
### preset default prefix
support OwlPay and OwlNest currently
```shell
cz -i
```
![image](https://user-images.githubusercontent.com/45550113/146726582-2b9cb2f7-e87a-400d-9bd8-afaed8ed44a9.png)

### Step 1
pick a commit type
```shell
cz
```

![image](https://user-images.githubusercontent.com/45550113/140848819-8b115e2b-3972-433d-8ae8-f8a4925c0f1d.png)

### Step 2
commit message

![image](https://user-images.githubusercontent.com/45550113/140848900-98233775-7707-48af-917b-ccff016b63ff.png)

### Step 3

if need to tag Jira issue for title prefix

![image](https://user-images.githubusercontent.com/45550113/146734689-bbba35f3-3d44-406f-aa31-716cdfd0c576.png)

### Step 4  (if Step3)

use default prefix

![image](https://user-images.githubusercontent.com/45550113/146734936-7edf55b1-1d29-4b56-856d-ae8b8bbba1f3.png)

or select another project

![image](https://user-images.githubusercontent.com/45550113/146735104-4c264618-ceac-476d-bedd-9301ca305e95.png)


### Step 5  (if Step3)
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
},
{
  name: 'storybook',
  emoji: '📚',
  description: 'New storybook',
  value: 'story'
},
{
  name: 'revert',
  emoji: '🔙',
  description: 'Revert a commit',
  value: 'revert'
}
```
#### Inspired by [cz-cli](https://github.com/commitizen/cz-cli)

## Todo

- [x] adapt for other projects prefix
- [ ] unit test
- [ ] CLI
