const fetch = require('isomorphic-fetch');
const hostedGitInfo = require('hosted-git-info');
const Generator = require('../util/base');
const get = require('lodash/get');
const chalk = require('chalk');

const API = 'https://circleci.com/api/v1.1';

function createCircleCiConfig({ context = null, builtFiles = ['./**'] } = {}) {
  function jobRef(name, spec) {
    if (!context && !spec) return name;
    return {
      [name]: {
        context,
        ...spec,
      },
    };
  }
  const NodeContainer = [
    {
      image: 'circleci/node:11',
    },
  ];
  // eslint-disable-next-line camelcase
  const AttachWorkspace = { attach_workspace: { at: '.' } };
  return {
    version: 2,
    jobs: {
      install: {
        docker: NodeContainer,
        steps: [
          'checkout',
          {
            run: {
              name: 'install',
              command: 'npm install',
            },
          },
          {
            // eslint-disable-next-line camelcase
            persist_to_workspace: {
              root: '.',
              paths: ['node_modules/**'],
            },
          },
        ],
      },
      build: {
        docker: NodeContainer,
        steps: [
          'checkout',
          AttachWorkspace,
          {
            run: {
              name: 'build',
              command: 'npm run build',
            },
          },
          {
            // eslint-disable-next-line camelcase
            persist_to_workspace: {
              root: '.',
              paths: builtFiles,
            },
          },
        ],
      },
      test: {
        docker: NodeContainer,
        steps: [
          'checkout',
          AttachWorkspace,
          {
            run: {
              name: 'test',
              command: 'npm test',
            },
          },
        ],
      },
      release: {
        docker: NodeContainer,
        steps: [
          'checkout',
          AttachWorkspace,
          {
            run: {
              name: 'release',
              command: 'npm run semantic-release',
            },
          },
        ],
      },
    },
    workflows: {
      version: 2,
      main: {
        jobs: [
          jobRef('install'),
          jobRef('build', { requires: ['install'] }),
          jobRef('test', { requires: ['install'] }),
          jobRef('release', { requires: ['build', 'test'] }),
        ],
      },
    },
  };
}

module.exports = class CircleCi extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option('newPassword', {
      type: Boolean,
      desc: 'Update your CircleCI password',
      required: false,
    });
    this.option('noContext', {
      type: Boolean,
      desc: "Don't use a CircleCI Context",
      required: false,
    });
    this.option('context', {
      type: String,
      desc: 'Preselect a CircleCI Context',
      required: false,
    });
    this.option('username', {
      type: String,
      desc: 'CircleCI username',
      required: false,
    });
    this.option('noSetup', {
      type: Boolean,
      desc:
        'Do not initialize your CircleCI project (just create files locally)',
      required: false,
    });
    this.option('repo', {
      type: String,
      desc: 'Set `repository` in package.json, if missing',
      required: false,
    });
  }

  async prompting() {
    if (!this.options.username) {
      const { username } = await this.prompt([
        {
          name: 'username',
          type: 'input',
          message: 'CircleCI username?',
          storeGlobal: true,
        },
      ]);
      this.options.username = username;
    }

    let password = null;
    if (!password) {
      const { circleCiToken: newPassword } = await this.prompt([
        {
          name: 'circleCiToken',
          type: 'password',
          message: 'CircleCI API token?',
          storeGlobal: true,
        },
      ]);
      password = newPassword;
    }
    this.password = password;

    if (!this.options.context && !this.options.context !== false) {
      const circleCiConfig = await this.readCircleCi();
      const workflows = get(circleCiConfig, 'workflows', {});
      const mainWorkflowJobs = get(
        workflows,
        [Object.keys(workflows).find((key) => key !== 'version'), 'jobs'],
        []
      );
      const defaultContextJob =
        mainWorkflowJobs.find((job) =>
          get(job, [Object.keys(job)[0], 'context'])
        ) || {};
      const contextFromConfig = get(defaultContextJob, [
        Object.keys(defaultContextJob)[0],
        'context',
      ]);
      const { context } = await this.prompt([
        {
          name: 'context',
          message: 'Which CircleCI context should be used?',
          storeGlobal: true,
          skipIfPossible: false,
          default: contextFromConfig,
          when: !contextFromConfig,
        },
      ]);
      this.options.context = context;
    }

    const pkgJson = await this.fs.readJSON(
      this.destinationPath('package.json')
    );

    if (!this.options.repo) {
      if (pkgJson.repository) this.options.repo = pkgJson.repository;
      else {
        const { repository } = await this.prompt([
          {
            name: 'repository',
            message: 'GitHub repository for the project?',
          },
        ]);
        this.options.repo = repository;
      }
    }

    const apiResponse = await (await fetch(
      `https://circleci.com/api/v1.1/me?circle-token=${password}`
    )).json();
    this._circleLog(`Logged in as ${chalk.bold(apiResponse.name)}`);
  }

  _circleLog(first, ...rest) {
    this.log(`${chalk.cyan('circleci')} ${first}`, ...rest);
  }

  async writing() {
    const pkgJson = await this.fs.readJSON(
      this.destinationPath('package.json')
    );

    let repo = pkgJson.repository || this.options.repo;
    if (!repo) {
      throw new Error(`Not sure how you managed it, but no repo was provided`);
    }
    if (typeof repo.url === 'string') {
      repo = repo.url;
    }
    repo = hostedGitInfo.fromUrl(repo);

    await this.writeCircleCi(
      createCircleCiConfig({
        context: this.options.context,
      })
    );

    const repoPath = `github/${repo.user}/${repo.project}`;
    await this.addReadmeBadge({
      name: 'circleci',
      altText: 'CircleCI',
      imageUrl: `https://img.shields.io/circleci/project/${repoPath}/master.svg?logo=circleci`,
      href: `https://circleci.com/gh/${repo.user}/${repo.project}`,
      priority: 5,
    });

    if (this.options.setup !== false) {
      try {
        const CREATE_PROJECT_URL = `${API}/project/${repoPath}/follow?circle-token=${
          this.password
        }`;
        const response = await fetch(CREATE_PROJECT_URL, {
          method: 'post',
        });
        if (!response.ok) {
          throw new Error(
            `[${response.status}] Could not initialize CircleCI project: ${
              response.statusText
            }`
          );
        }
        this._circleLog(
          `CircleCI is following your project ${chalk.bold(
            `"${repo.user}/${repo.project}"`
          )}`
        );
      } catch (err) {
        if (!this.options.isSubgenerator)
          err.message += `\n\nMaybe try using the --no-setup flag?`;
        throw err;
      }
    }
  }

  end() {
    this._circleLog(
      `Next time you push to the ${chalk.bold(
        'master'
      )} branch, CircleCI will build and publish your package according to your configuration.`
    );
  }
};
