import prompts from 'prompts';
import execa from 'execa';
import picocolors from 'picocolors';
import fs from 'fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import yargs from 'yargs/yargs';

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

const __dirname$2 = dirname(fileURLToPath(import.meta.url));
const rootPath$1 = resolve(__dirname$2, "../");
const loadProjectConfig = (filePath) => {
  try {
    const config = fs.readFileSync(filePath, "utf8");
    return JSON.parse(config);
  } catch (e) {
    return null;
  }
};
const getDefaultProjectValue = (config) => {
  return config?.defaultProject || "";
};
const buildCommitTypesList = () => {
  return commitTypes.map((type) => ({
    title: type.name,
    description: `${type.emoji} ${type.description}`,
    value: type.value,
    emoji: type.emoji
  }));
};
const buildProjectsList = () => {
  return projects.map((project) => ({
    title: project.name,
    description: `[${project.prefix}-13845] title`,
    value: project.value
  }));
};
const findCommitType = (commitTypeValue) => {
  return commitTypes.find((type) => type.value === commitTypeValue);
};
const findProject = (projectValue) => {
  return projects.find((project) => project.value === projectValue);
};
const buildCommitTitle = (commitType, message) => {
  const type = findCommitType(commitType);
  if (!type) {
    throw new Error(`Invalid commit type: ${commitType}`);
  }
  return `${type.emoji} ${commitType}: ${message}`;
};
const buildFinalCommitMessage = (commitTitle, response, defaultProjectValue) => {
  const { is_jira, is_default_project, project_type, jira_id } = response;
  if (!is_jira) {
    return commitTitle;
  }
  const typeResponse = is_default_project ? defaultProjectValue : project_type;
  const projectType = findProject(typeResponse);
  if (!projectType) {
    throw new Error(`Invalid project type: ${typeResponse}`);
  }
  if (!jira_id) {
    throw new Error("Jira ID is required when using Jira integration");
  }
  return `[${projectType.prefix}-${jira_id}] ${commitTitle}`;
};
const buildGitCommands = (commitMessage, description) => {
  if (description) {
    return ["commit", "-m", commitMessage, "-m", description];
  }
  return ["commit", "-m", commitMessage];
};
const parseCommitResult = (stdout) => {
  const branchHashName = stdout.match(/\[(.*?)\]/)?.pop();
  if (!branchHashName) {
    throw new Error("Could not parse commit result");
  }
  const [branchName, branchHash] = branchHashName.split(" ");
  return { branch: branchName, hash: branchHash };
};
const buildPromptSteps = (defaultProjectValue, projectsList, typesList) => {
  const defaultProject = projectsList.find((project) => project.value === defaultProjectValue);
  const step_type = {
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
    choices: projectsList,
    initial: "owlpay",
    fallback: "No matched project."
  };
  const step_jira_id = {
    type: (prev) => prev ? "number" : null,
    name: "jira_id",
    message: "Jira issue id",
    onRender() {
      this.msg = picocolors.bgCyan(picocolors.white(" Jira issue ID "));
    },
    validate: (value) => {
      if (!value) {
        return "Jira issue ID is required.";
      }
      return true;
    }
  };
  return [
    step_type,
    step_message,
    step_description,
    step_is_jira,
    defaultProject?.value ? step_is_default_project : null,
    step_project_type,
    step_jira_id
  ].filter(Boolean);
};
const showConfigMissingWarning = () => {
  console.log(picocolors.yellow(picocolors.italic(" \u{1F4A1} You can try `cz -i` to choose a default project prefix. ")));
};
const showCancelMessage = () => {
  console.log(picocolors.magenta(" commit abort. "));
};
const showCommitResult = (result) => {
  console.log("-----------------------------------------------------------");
  console.log(`${picocolors.bgGreen(picocolors.bold(" Title       "))} ${picocolors.green(result.title)}`);
  if (result.description) {
    console.log(`${picocolors.bgGreen(picocolors.bold(" Description "))} ${picocolors.green(result.description)}`);
  }
  if (result.hash && result.branch) {
    console.log(`${picocolors.bgGreen(picocolors.bold(" Commit hash "))} ${picocolors.bold(picocolors.cyan(` ${result.hash} `))} (${picocolors.italic(picocolors.green(result.branch))})`);
  }
};
const showGitOutput = (stdout, stderr) => {
  console.log("-----------------------------------------------------------");
  console.log(picocolors.dim(stdout));
  if (stderr && stderr !== "") {
    console.log("-----------------------------------------------------------");
    console.log(picocolors.dim(stderr));
  }
  console.log("-----------------------------------------------------------");
};
const showGitError = (error) => {
  console.log(picocolors.red(error.stderr));
  if (error.exitCode === 1) {
    console.log(picocolors.bgRed(" No changes added to commit. "));
  } else {
    console.error(error);
  }
};
const cli = async () => {
  const configPath = resolve(rootPath$1, "keep/cz_config.json");
  const config = loadProjectConfig(configPath);
  const defaultProjectValue = getDefaultProjectValue(config);
  if (!config) {
    showConfigMissingWarning();
  }
  const typesList = buildCommitTypesList();
  const projectsList = buildProjectsList();
  const steps = buildPromptSteps(defaultProjectValue, projectsList, typesList);
  let isCanceled = false;
  const response = await prompts(steps, {
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
    showCancelMessage();
    return false;
  }
  try {
    const commitTitle = buildCommitTitle(response.commit_type, response.commit_message);
    const finalCommitMessage = buildFinalCommitMessage(commitTitle, response, defaultProjectValue);
    const gitCommands = buildGitCommands(finalCommitMessage, response.commit_description);
    const commitResult = await execa("git", gitCommands);
    const { branch, hash } = parseCommitResult(commitResult.stdout);
    showGitOutput(commitResult.stdout, commitResult.stderr);
    showCommitResult({
      title: finalCommitMessage,
      description: response.commit_description,
      hash,
      branch
    });
    return true;
  } catch (error) {
    showGitError(error);
    return false;
  }
};

const __dirname$1 = dirname(fileURLToPath(import.meta.url));
const rootPath = resolve(__dirname$1, "../");
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
  const response = await prompts([step_type], {
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
    console.log(picocolors.magenta(" init abort. "));
    return false;
  }
  const { set_default_project } = response;
  try {
    const filePath = resolve(rootPath, "keep/cz_config.json");
    fs.writeFileSync(
      filePath,
      `${JSON.stringify({ defaultProject: set_default_project }, null, 2)}`
    );
    console.log(picocolors.green(` default project set: ${set_default_project} `));
  } catch (error) {
    console.log(picocolors.bgRed(picocolors.white(`init Fail: ${error}`)));
  }
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const where = () => {
  console.log(`Your config will be saved in ${__dirname}.`);
};

async function run(args) {
  const argv = yargs(args).options({
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

export { run };
