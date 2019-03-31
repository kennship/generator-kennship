const Generator = require('../util/base');
const { mergeGitignore } = require('../util/gitignore');

module.exports = class Gitignore extends Generator {
  async writing() {
    const templateGitignore = (await this.fs.read(
      this.templatePath('node.gitignore')
    )).split('\n');
    await this.updateFileContent(
      this.destinationPath('.gitignore'),
      (original) => {
        const originalLines = original.split('\n');
        return mergeGitignore(originalLines, templateGitignore).join('\n');
      }
    );
  }
};
