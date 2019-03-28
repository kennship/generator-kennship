'use strict';
const path = require('path');
const helpers = require('yeoman-test');
const fs = require('fs');

describe('generator-kennship:code-style', () => {
  let projectDir = null;
  let pkgJson = null;
  beforeAll(async () => {
    await helpers
      .run(path.join(__dirname, '../generators/code-style'))
      .inTmpDir((dir) => {
        projectDir = dir;
      })
      .withPrompts({ projectType: 'node' });
    pkgJson = JSON.parse(fs.readFileSync(`${projectDir}/package.json`));
  });

  it('sets up ESLint config', () => {
    expect(typeof pkgJson.eslintConfig).toBe('object');
    expect(pkgJson.eslintConfig.extends).toEqual(['xo', 'prettier']);
  });

  it('sets up Prettier config', () => {
    expect(typeof pkgJson.prettier).toBe('object');
    expect(pkgJson.prettier.arrowParens).toBe('always');
  });
});
