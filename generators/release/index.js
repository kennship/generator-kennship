const get = require('lodash/get');
const Generator = require('../util/base');

const SEMANTIC_RELEASE_DEPENDENCIES = {
  'semantic-release': '^15.13.3',
  '@semantic-release/changelog': '^3.0.2',
  '@semantic-release/commit-analyzer': '^6.1.0',
  '@semantic-release/git': '^7.0.8',
  '@semantic-release/github': '^5.2.10',
  '@semantic-release/npm': '^5.1.4',
  '@semantic-release/release-notes-generator': '^7.1.4',
};

function createSemanticReleaseConfig({ usePack = false } = {}) {
  return {
    branch: 'master',
    plugins: [
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator',
      '@semantic-release/changelog',
      ['@semantic-release/npm', ...(usePack ? [{ pkgRoot: './pkg' }] : [])],
      '@semantic-release/github',
      [
        '@semantic-release/git',
        {
          assets: ['CHANGELOG.md'],
          message:
            // eslint-disable-next-line no-template-curly-in-string
            'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
        },
      ],
    ],
  };
}

module.exports = class Release extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option('usePack', {
      type: Boolean,
      required: false,
      default: false,
      desc: 'Set this flag if you are using @pika/pack.',
    });
  }

  async writing() {
    await this.addReadmeBadge({
      name: 'semantic-release',
      imageUrl: `https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg`,
      href: 'https://github.com/semantic-release/semantic-release',
      priority: 95,
    });

    const { usePack } = this.options;

    await this.updatePackageJson((pkg) => ({
      ...pkg,
      version: '0.0.0-semantically-released',
      scripts: {
        'semantic-release': 'semantic-release',
        ...get(pkg, 'scripts', {}),
      },
      devDependencies: {
        ...SEMANTIC_RELEASE_DEPENDENCIES,
        ...get(pkg, 'devDependencies', {}),
      },
      release: createSemanticReleaseConfig({ usePack }),
    }));
  }

  async installing() {
    this.npmInstall();
  }
};
