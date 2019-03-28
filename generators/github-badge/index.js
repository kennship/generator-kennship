const Generator = require('../util/base');
const get = require('lodash/get');
const hostedGitInfo = require('hosted-git-info');

module.exports = class GithubBadge extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option('badgeType', {
      type: String,
      desc: 'What to display in the repo badge (stars, fork, watchers)',
      required: false,
    });
  }

  async writing() {
    const pkgJson =
      this.options.pkgJson ||
      (await this.fs.readJSON(this.destinationPath('package.json')));

    const {
      badgeType = get(pkgJson, 'private') ? 'watchers' : 'stars',
    } = this.options;

    const { domain, user, project } =
      hostedGitInfo.fromUrl(
        get(pkgJson, 'repository.url', get(pkgJson, 'repository'))
      ) || {};

    if (domain !== 'github.com') return;

    let imageUrl = null;
    switch (badgeType) {
      case 'stars':
        imageUrl = `https://img.shields.io/github/stars/${user}/${project}.svg`;
        break;
      case 'fork':
        imageUrl = `https://img.shields.io/github/forks/${user}/${project}.svg`;
        break;
      case 'watchers':
      default:
        imageUrl = `https://img.shields.io/github/watchers/${user}/${project}.svg`;
        break;
    }
    if (!imageUrl) return;
    const href = `https://github.com/${user}/${project}`;

    await this.addReadmeBadge({
      name: 'github',
      altText: `GitHub repository`,
      imageUrl,
      href,
      priority: 80,
    });
  }
};
