const Generator = require('../util/base');
const { normalizeRepository, getRepoHosting } = require('../util/repo');
const { URL: Url } = require('url');

module.exports = class Bugs extends Generator {
  async writing() {
    const pkgJson = await this.fs.readJSON(
      this.destinationPath('package.json')
    );
    const repo = normalizeRepository(pkgJson.repository);

    let bugs = pkgJson.bugs;
    const gitHost = getRepoHosting(repo);
    if (!bugs && repo) {
      bugs = gitHost.bugs();
    }

    let imageUrl = ``;

    if (/(jira)|(atlassian\.net)/.test(bugs)) {
      const jiraColor = this._globalConfig.get('brandColor') || 'blue';
      let label = 'issues';
      let message = 'Jira';
      let match = /(projects\/|projectKey=)(\w+)/.exec(bugs);
      if (match) {
        label = 'Jira';
        message = match[2];
      }
      imageUrl = `https://img.shields.io/badge/${label}-${message}-${jiraColor}.svg?logo=jira`;
    } else if (bugs && new Url(bugs).host === 'github.com') {
      if (pkgJson.private)
        imageUrl = `https://img.shields.io/github/issues/${gitHost.user}/${
          gitHost.project
        }.svg?logo=github`;
      else
        imageUrl = `https://img.shields.io/github/issues/${gitHost.user}/${
          gitHost.project
        }.svg?logo=github`;
    }

    await this.addReadmeBadge({
      name: 'bugs',
      altText: 'Project issues',
      imageUrl,
      href: bugs,
      priority: 40,
    });

    if (bugs !== pkgJson.bugs) {
      await this.updatePackageJson((pkg) => ({ ...pkg, bugs }));
    }
  }
};
