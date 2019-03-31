const Generator = require('yeoman-generator');
const sortPkg = require('sort-package-json');
const Yaml = require('js-yaml');
const addBadge = require('../util/add-badge');
const getDockerImage = require('../util/circleci');

module.exports = class Base extends Generator {
  async updatePackageJson(updater) {
    const pkg = await this.fs.readJSON(
      this.destinationPath('package.json'),
      {}
    );
    const newPkg = sortPkg(updater(pkg));
    await this.fs.writeJSON(this.destinationPath('package.json'), newPkg);
  }

  async prompt(questions, ...rest) {
    const earlyResults = {};
    const result = await Generator.prototype.prompt.call(
      this,
      questions.map(({ storeGlobal, skipIfPossible = true, ...q }) => {
        const defaultValue = this._globalConfig.get(q.name);
        if (storeGlobal && defaultValue !== undefined)
          earlyResults[q.name] = defaultValue;
        return {
          default: defaultValue,
          when: skipIfPossible ? !defaultValue : q.when,
          ...q,
        };
      }),
      ...rest
    );
    const final = { ...earlyResults, ...result };
    questions.forEach(({ name, storeGlobal }) => {
      if (storeGlobal && name in final) {
        this._globalConfig.set(name, final[name]);
      }
    });
    return final;
  }

  async updateFileContent(filename, updater) {
    const original = await this.fs.read(filename);
    const newVersion = await updater(original);
    await this.fs.write(filename, newVersion);
  }

  async addReadmeBadge(badgeOpts) {
    const readmePath = this.destinationPath('README.md');
    const readme = await this.fs.read(readmePath);
    await this.fs.write(readmePath, await addBadge(readme, badgeOpts));
  }

  circleCiFilename() {
    return this.destinationPath('.circleci/config.yml');
  }

  async writeCircleCi(contents) {
    const circleCiFilename = this.circleCiFilename();
    await this.fs.write(circleCiFilename, `---\n${Yaml.safeDump(contents)}`);
  }

  async readCircleCi() {
    const circleCiFilename = this.circleCiFilename();
    if (!(await this.fs.exists(circleCiFilename))) {
      return null;
    }
    return Yaml.safeLoad(await this.fs.read(circleCiFilename));
  }

  async updateCircleCi(updater) {
    let prevConfig = (await this.readCircleCi()) || {};
    const nextConfig = updater(prevConfig, {
      getDockerImage: (...args) => getDockerImage(prevConfig, ...args),
    });
    await this.writeCircleCi(nextConfig);
  }
};
