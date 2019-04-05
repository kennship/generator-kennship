const Generator = require('../util/base');

module.exports = class Test extends Generator {
  async writing() {
    await this.updatePackageJson((pkg) => ({
      ...pkg,
      scripts: {
        test: 'jest',
      },
      devDependencies: {
        ...(pkg.devDependencies || {}),
        jest: '^24.1.0',
      },
      jest: {
        roots: ['<rootDir>/src'],
      },
    }));
  }

  async installing() {
    this.npmInstall();
  }
};
