const Generator = require('yeoman-generator');
const sortPkg = require('sort-package-json');
const Yaml = require('js-yaml');
const { dirname } = require('path');

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
        if (defaultValue) earlyResults[q.name] = defaultValue;
        return {
          default: defaultValue,
          when: skipIfPossible ? !defaultValue : q.when,
          ...q,
        };
      }),
      ...rest
    );
    questions.forEach(({ name, storeGlobal }) => {
      if (storeGlobal) {
        this._globalConfig.set(name, result[name]);
      }
    });
    return { ...result, ...earlyResults };
  }

  async writeCircleCi(contents) {
    const circleCiFilename = this.destinationPath('.circleci/config.yml');
    await this.fs.write(circleCiFilename, `---\n${Yaml.safeDump(contents)}`);
  }

  async updateCircleCi(updater) {
    let prevConfig = {};
    const circleCiFilename = this.destinationPath('.circleci/config.yml');
    if (
      (await this.fs.exists(dirname(circleCiFilename))) &&
      (await this.fs.exists(circleCiFilename))
    ) {
      prevConfig = Yaml.safeLoad(await this.fs.read(circleCiFilename));
    }
    const nextConfig = updater(prevConfig);
    await this.writeCircleCi(nextConfig);
  }
};
