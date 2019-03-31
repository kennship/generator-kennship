const Generator = require('../util/base');
const defaults = require('lodash/defaults');

module.exports = class Readme extends Generator {
  async writing() {
    const pkgJson = defaults(
      {},
      this.options.pkgJson ||
        (await this.fs.readJSON(this.destinationPath('package.json'))) ||
        {},
      {
        name: 'package.name',
        description: 'package.description',
      }
    );
    await this.fs.copyTpl(
      this.templatePath('readme.tpl.md'),
      this.destinationPath('README.md'),
      {
        package: pkgJson,
      }
    );
  }
};
