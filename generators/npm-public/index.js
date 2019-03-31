import get from 'lodash/get';
const Generator = require('../util/base');

module.exports = class NpmPublic extends Generator {
  async writing() {
    const pkgJson = await this.fs.readJSON(
      this.destinationPath('package.json')
    );

    const packageName = get(pkgJson, 'name');
    const imageUrl = `https://img.shields.io/npm/v/${packageName}.svg`;
    const href = `https://www.npmjs.com/package/${packageName}`;

    await this.addReadmeBadge({
      name: 'npm',
      altText: 'npm package',
      imageUrl,
      href,
      priority: 0,
    });
  }
};
