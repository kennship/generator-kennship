'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

const gen = (name) => require.resolve(`generator-kennship/generators/${name}`);

const GENERATORS = [
  {
    name: 'gitignore',
    path: gen('gitignore'),
    checked: true,
  },
  {
    name: 'readme',
    displayName: 'README.md',
    path: gen('readme'),
    checked: true,
  },
  {
    name: 'code-style',
    displayName: 'Code style',
    path: gen('code-style'),
    checked: true,
  },
  {
    name: 'pack',
    displayName: '@pika/pack',
    path: gen('pack'),
    checked: true,
  },
  {
    name: 'release',
    displayName: 'Semantic Release',
    path: gen('release'),
    checked: true,
  },
  {
    name: 'bugs',
    path: gen('bugs'),
    checked: true,
  },
  {
    name: 'test',
    path: gen('test'),
    checked: true,
  },
  {
    name: 'maintained',
    path: gen('maintained'),
    checked: false,
  },
  {
    name: 'github-repo',
    path: gen('github-repo'),
    checked: false,
  },
  {
    name: 'circle-ci',
    displayName: 'Circle CI',
    path: gen('circle-ci'),
    checked: true,
  },
  {
    name: 'github-badge',
    displayName: 'GitHub badge',
    path: gen('github-badge'),
    checked: false,
  },
];

module.exports = class extends Generator {
  async prompting() {
    const { subgenerators: response } = await this.prompt([
      {
        type: 'checkbox',
        name: 'subgenerators',
        message: 'Which subgenerators should run?',
        choices: GENERATORS.map((generator) => ({
          name: generator.displayName || generator.name,
          value: generator,
          checked: generator.checked,
        })),
      },
    ]);

    const subgenerators = {};

    response.forEach((item) => {
      subgenerators[item.name] = item;
    });

    Object.keys(subgenerators).forEach((key) => {
      let opts = {};
      const item = subgenerators[key];
      if (typeof item.getOpts === 'function') {
        opts = item.getOpts(subgenerators);
      }
      this.composeWith(item.path, opts);
    });
  }
};
