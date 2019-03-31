const Generator = require('../util/base');
const pick = require('lodash/pick');
const defaults = require('lodash/defaults');
const get = require('lodash/get');

const PIKA_LATEST = '^0.3.14';

const PACK_DEPS = {
  '@pika/pack': '^0.3.1',
  '@pika/plugin-build-node': PIKA_LATEST,
  '@pika/plugin-standard-pkg': PIKA_LATEST,
  'npm-run-all': '^4.1.5',
  'cross-env': '^5.2.0',
};

const Pipelines = {
  Node: [
    [
      '@pika/plugin-standard-pkg',
      {
        exclude: ['__tests__/**'],
      },
    ],
    [
      '@pika/plugin-build-node',
      {
        minNodeVersion: '8',
      },
    ],
  ],
};

module.exports = class Pack extends Generator {
  async writing() {
    await this.updatePackageJson((pkg) => ({
      main: 'src/index.js',
      ...pkg,
      scripts: {
        build: 'npm-run-all build:pkg',
        'build:pkg': 'pack build',
        ...get(pkg, 'scripts', {}),
      },
      devDependencies: defaults(
        {},
        pick(PACK_DEPS, [
          '@pika/pack',
          '@pika/plugin-build-node',
          '@pika/plugin-standard-pkg',
          'npm-run-all',
        ]),
        get(pkg, 'devDependencies', {})
      ),
      '@pika/pack': {
        pipeline: Pipelines.Node,
      },
    }));

    const main = get(
      await this.fs.readJSON(this.destinationPath('package.json')),
      ['main'],
      'src/index.js'
    );
    if (!(await this.fs.exists(this.destinationPath(main)))) {
      await this.fs.write(this.destinationPath(main), `// TODO (app entry)`);
    }
  }

  async installing() {
    this.npmInstall();
  }
};
