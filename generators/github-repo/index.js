const fetch = require('isomorphic-fetch');
const hostedGitInfo = require('hosted-git-info');
const Generator = require('../util/base');
const get = require('lodash/get');
const chalk = require('chalk');
const moment = require('moment');
const execa = require('execa');
const { normalizeRepository } = require('../util/repo');

const API = 'https://api.github.com/graphql';
const PERSONAL_ACCESS_TOKEN_URL = `https://github.com/settings/tokens`;

async function gql(password, query, variables) {
  const response = await fetch(API, {
    method: 'post',
    headers: {
      Authorization: `Bearer ${password}`,
    },
    body: JSON.stringify({
      query,
      ...(variables ? { variables } : null),
    }),
  });
  if (!response.ok) throw new Error(response.statusText);
  const result = await response.json();
  return result;
}

module.exports = class GithubRepo extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option('newPassword', {
      type: Boolean,
      desc: 'Update your GitHub password',
      required: false,
    });
    this.option('username', {
      type: String,
      desc: 'GitHub username',
      required: false,
    });
    this.option('repoName', {
      type: String,
      desc:
        'Either a simple repo name ("myproject") or org + repo name ("mycompany/myproject")',
      required: false,
    });
  }

  async prompting() {
    if (!this.options.username) {
      const { githubUsername } = await this.prompt([
        {
          name: 'githubUsername',
          type: 'input',
          message: 'GitHub username?',
          storeGlobal: true,
        },
      ]);
      this.options.username = githubUsername;
    }

    let password = null;

    if (!password) {
      this.log(
        `If you don't have a GitHub personal access token handy,${''} create one at ${PERSONAL_ACCESS_TOKEN_URL}`
      );
      const { githubToken } = await this.prompt([
        {
          name: 'githubToken',
          type: 'password',
          message: 'GitHub personal access token?',
          storeGlobal: true,
        },
      ]);
      password = githubToken;
    }
    this.password = password;

    let repoName = this.options.repoName;
    if (!repoName) {
      let repo = normalizeRepository(
        get(
          await this.fs.readJSON(this.destinationPath('package.json')),
          'repository'
        )
      );
      if (repo) {
        const { user, project } = hostedGitInfo.fromUrl(repo);
        repoName = `${user}/${project}`;
      }
    }
    if (!repoName) {
      repoName = (await this.prompt([
        {
          name: 'repoName',
          type: 'input',
          message: 'Name for repository?',
        },
      ])).repoName;
    }
    const repoSplit = repoName.split('/');
    let orgName;
    switch (repoSplit.length) {
      case 0:
        throw new Error('No repo name provided');
      case 1: {
        const result = await gql(
          password,
          `query { 
            viewer {
              login
              organizations(first: 10) {
                nodes {
                  name
                  login
                }
              }
            }
          }`
        );
        const ghUser = get(result, 'data.viewer.login');
        let choices = [
          {
            name: `You (${ghUser})`,
            value: ghUser,
          },
        ];
        const orgChoices = get(
          result,
          'data.viewer.organizations.nodes',
          []
        ).map(({ name, login }) => ({
          name,
          value: login,
        }));
        if (orgChoices.length) {
          choices = [
            ...choices,
            { type: 'separator' },
            ...orgChoices,
            { type: 'separator' },
          ];
        }
        const { newOrgName } = await this.prompt([
          {
            name: 'newOrgName',
            type: 'list',
            choices,
          },
        ]);
        orgName = newOrgName;
        break;
      }
      default:
        [orgName, repoName] = repoSplit;
    }
    this.options.repoName = `${orgName}/${repoName}`;
  }

  _githubLog(first, ...rest) {
    this.log(`${chalk.cyan('github')} ${first}`, ...rest);
  }

  async _createRepoIfNeeded() {
    const [owner, name] = this.options.repoName.split('/');
    const doesRepoExist = await gql(
      this.password,
      `query ($name: String!, $owner: String!) {
      repository(owner: $owner, name: $name) {
        createdAt
      }
    }
    `,
      { name, owner }
    );
    const maybeTimestamp = get(
      doesRepoExist,
      'data.repository.createdAt',
      null
    );
    if (maybeTimestamp) {
      this._githubLog(
        `Repo ${chalk.bold(this.options.repoName)} already exists`
      );
      this._githubLog(
        `(created ${chalk.blue(moment(new Date(maybeTimestamp)).fromNow())})`
      );
      return;
    }
    this._githubLog(`Creating repo ${chalk.bold(this.options.repoName)}...`);
  }

  async _doesOriginExist() {
    try {
      await execa('git', ['remote', 'show', 'origin'], {
        cwd: this.destinationPath(),
      });
      return true;
    } catch (err) {
      return false;
    }
  }

  async _ensureOrigin() {
    if (await this._doesOriginExist()) return;
    const fullOrigin = hostedGitInfo.fromUrl(this.options.repoName).ssh();
    await execa('git', ['remote', 'add', 'origin', fullOrigin]);
    this._githubLog(`Added remote origin ${chalk.cyan(fullOrigin)}`);
  }

  async writing() {
    await this._createRepoIfNeeded();
    await this._ensureOrigin();
  }
};
