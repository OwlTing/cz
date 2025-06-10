'use strict';

const prompts = require('prompts');
const execa = require('execa');
const picocolors = require('picocolors');
const fs = require('fs');
const node_path = require('node:path');
const node_url = require('node:url');
const yargs = require('yargs/yargs');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e.default : e; }

const prompts__default = /*#__PURE__*/_interopDefaultCompat(prompts);
const execa__default = /*#__PURE__*/_interopDefaultCompat(execa);
const picocolors__default = /*#__PURE__*/_interopDefaultCompat(picocolors);
const fs__default = /*#__PURE__*/_interopDefaultCompat(fs);
const yargs__default = /*#__PURE__*/_interopDefaultCompat(yargs);

const commitTypes = [
  {
    name: "chore",
    emoji: "\u{1F9F9}",
    description: "Build process or auxiliary tool changes",
    value: "chore"
  },
  {
    name: "ci",
    emoji: "\u{1F477}",
    description: "CI related changes",
    value: "ci"
  },
  {
    name: "docs",
    emoji: "\u{1F4DD}",
    description: "Documentation only changes",
    value: "docs"
  },
  {
    name: "feat",
    emoji: "\u{1F4A1}",
    description: "A new feature",
    value: "feat"
  },
  {
    name: "fix",
    emoji: "\u{1F41B}",
    description: "A bug fix",
    value: "fix"
  },
  {
    name: "hotfix",
    emoji: "\u{1F6A8}",
    description: "Emergency fix",
    value: "hotfix"
  },
  {
    name: "perf",
    emoji: "\u26A1",
    description: "A code change that improves performance",
    value: "perf"
  },
  {
    name: "refactor",
    emoji: "\u{1F528}",
    description: "A code change that neither fixes a bug or adds a feature",
    value: "refactor"
  },
  {
    name: "release",
    emoji: "\u{1F389}",
    description: "Create a release commit",
    value: "release"
  },
  {
    name: "style",
    emoji: "\u{1F3A8}",
    description: "Markup, white-space, formatting, missing semi-colons...",
    value: "style"
  },
  {
    name: "test",
    emoji: "\u{1F3AE}",
    description: "Adding missing tests",
    value: "test"
  },
  {
    name: "storybook",
    emoji: "\u{1F4DA}",
    description: "New storybook",
    value: "storybook"
  },
  {
    name: "revert",
    emoji: "\u{1F519}",
    description: "Revert a commit",
    value: "revert"
  }
];

const projects = [
  {
    name: "OwlPay",
    prefix: "OWLPAY",
    value: "owlpay"
  },
  {
    name: "OwlNest",
    prefix: "OW",
    value: "owlnest"
  },
  {
    name: "Market",
    prefix: "MAR",
    value: "market"
  },
  {
    name: "PayNow",
    prefix: "PN",
    value: "paynow"
  },
  {
    name: "Wallet Pro",
    prefix: "WP",
    value: "wallet-pro"
  }
];

const __dirname$3 = node_path.dirname(node_url.fileURLToPath((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.src || new URL('index.cjs', document.baseURI).href))));
const rootPath$1 = node_path.resolve(__dirname$3, "../");
let defaultProjectValue = "";
try {
  const filePath = node_path.resolve(rootPath$1, "keep/cz_config.json");
  const config = fs__default.readFileSync(filePath);
  defaultProjectValue = JSON.parse(config).defaultProject;
} catch (e) {
  console.log(picocolors__default.yellow(picocolors__default.italic(" \u{1F4A1} You can try `cz -i` to choose a default project prefix. ")));
  defaultProjectValue = "";
}
const typesList = commitTypes.map((type) => ({
  title: type.name,
  description: `${type.emoji} ${type.description}`,
  value: type.value,
  emoji: type.emoji
}));
const step_type$1 = {
  type: "autocomplete",
  name: "commit_type",
  message: "Pick a commit type.",
  choices: typesList,
  fallback: "No matched type."
};
const step_message = {
  type: "text",
  name: "commit_message",
  message: (prev) => {
    const target = typesList.find((type) => type.value === prev);
    return `${target.emoji} ${target.title}`;
  },
  validate: (value) => {
    if (!value) {
      return "Commit message is required.";
    }
    return true;
  }
};
const step_description = {
  type: "text",
  name: "commit_description",
  message: "Commit description (optional)",
  initial: "",
  validate: (value) => {
    if (value.length > 100) {
      return "Description is too long.";
    }
    return true;
  }
};
const step_is_jira = {
  type: "confirm",
  name: "is_jira",
  message: "Tag Jira issue ?",
  initial: false
};
const projectsList$1 = projects.map((project) => ({
  title: project.name,
  description: `[${project.prefix}-13845] title`,
  value: project.value
}));
const defaultProject = projectsList$1.find((project) => project.value === defaultProjectValue);
const step_is_default_project = {
  type: (prev) => prev ? "confirm" : null,
  name: "is_default_project",
  message: `use '${defaultProject?.title}' pattern? e.g. ${defaultProject?.description}`,
  initial: true
};
const step_project_type = {
  type: (prev, { is_jira }) => {
    return is_jira ? defaultProject?.value && prev ? null : "autocomplete" : null;
  },
  name: "project_type",
  message: "Pick a project type.",
  choices: projectsList$1,
  initial: "owlpay",
  fallback: "No matched project."
};
const step_jira_id = {
  type: (prev) => prev ? "number" : null,
  name: "jira_id",
  message: "Jira issue id",
  onRender() {
    this.msg = picocolors__default.bgCyan(picocolors__default.white(" Jira issue ID "));
  },
  validate: (value) => {
    if (!value) {
      return "Jira issue ID is required.";
    }
    return true;
  }
};
const cli = async () => {
  let isCanceled = false;
  const order = [
    step_type$1,
    step_message,
    step_description,
    step_is_jira,
    defaultProject?.value ? step_is_default_project : null,
    step_project_type,
    step_jira_id
  ].filter(Boolean);
  const response = await prompts__default(order, {
    onSubmit: (prompt, answers) => {
      if (answers === void 0) {
        isCanceled = true;
        return true;
      }
    },
    onCancel: (prompt) => {
      isCanceled = true;
      return false;
    }
  });
  if (isCanceled) {
    console.log(picocolors__default.magenta(" commit abort. "));
    return false;
  }
  const { commit_type, commit_message, commit_description, is_jira, is_default_project, project_type, jira_id } = response;
  const type = typesList.find((type2) => type2.value === commit_type);
  const commitTitle = `${type.emoji} ${commit_type}: ${commit_message}`;
  const typeResponse = is_default_project ? defaultProject?.value : project_type;
  const projectType = projects.find((project) => project.value === typeResponse);
  const result = is_jira ? `[${projectType.prefix}-${jira_id}] ${commitTitle}` : commitTitle;
  try {
    const commands = commit_description ? ["commit", "-m", result, "-m", commit_description] : ["commit", "-m", result];
    const commitResult = await execa__default("git", commands);
    const branchHashName = commitResult.stdout.match(/\[(.*?)\]/).pop();
    const [branchName, branchHash] = branchHashName.split(" ");
    console.log("-----------------------------------------------------------");
    console.log(picocolors__default.dim(commitResult.stdout));
    if (commitResult.stderr !== "") {
      console.log("-----------------------------------------------------------");
      console.log(picocolors__default.dim(commitResult.stderr));
    }
    console.log("-----------------------------------------------------------");
    console.log(`${picocolors__default.bgGreen(picocolors__default.bold(" Title       "))} ${picocolors__default.green(result)}`);
    if (commit_description) {
      console.log(`${picocolors__default.bgGreen(picocolors__default.bold(" Description "))} ${picocolors__default.green(commit_description)}`);
    }
    console.log(`${picocolors__default.bgGreen(picocolors__default.bold(" Commit hash "))} ${picocolors__default.bold(picocolors__default.cyan(` ${branchHash} `))} (${picocolors__default.italic(picocolors__default.green(branchName))})`);
  } catch (error) {
    console.log(picocolors__default.red(error.stderr));
    if (error.exitCode === 1)
      console.log(picocolors__default.bgRed(" No changes added to commit. "));
    else
      console.error(error);
  }
};

const __dirname$2 = node_path.dirname(node_url.fileURLToPath((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.src || new URL('index.cjs', document.baseURI).href))));
const rootPath = node_path.resolve(__dirname$2, "../");
const projectsList = projects.map((project) => ({
  title: project.name,
  description: `[${project.prefix}-13845] title`,
  value: project.value
}));
const step_type = {
  type: "autocomplete",
  name: "set_default_project",
  message: "Set default project prefix.",
  choices: projectsList,
  fallback: "No matched project."
};
const init = async () => {
  let isCanceled = false;
  const response = await prompts__default([step_type], {
    onSubmit: (prompt, answers) => {
      if (answers === void 0) {
        isCanceled = true;
        return true;
      }
    },
    onCancel: (prompt) => {
      isCanceled = true;
      return false;
    }
  });
  if (isCanceled) {
    console.log(picocolors__default.magenta(" init abort. "));
    return false;
  }
  const { set_default_project } = response;
  try {
    const filePath = node_path.resolve(rootPath, "keep/cz_config.json");
    fs__default.writeFileSync(
      filePath,
      `${JSON.stringify({ defaultProject: set_default_project }, null, 2)}`
    );
    console.log(picocolors__default.green(` default project set: ${set_default_project} `));
  } catch (error) {
    console.log(picocolors__default.bgRed(picocolors__default.white(`init Fail: ${error}`)));
  }
};

const __dirname$1 = node_path.dirname(node_url.fileURLToPath((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.src || new URL('index.cjs', document.baseURI).href))));
const where = () => {
  console.log(`Your config will be saved in ${__dirname$1}.`);
};

async function run(args) {
  const argv = yargs__default(args).options({
    "init": {
      alias: "i",
      describe: "Set default project prefix."
    },
    "where": {
      alias: "w",
      describe: "Show config file path."
    }
  }).help().argv;
  if (argv.init) {
    await init();
  } else if (argv.where) {
    where();
  } else {
    cli();
  }
}

exports.run = run;
