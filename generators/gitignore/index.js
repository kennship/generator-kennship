const Generator = require('../util/base');
const { mergeGitignore } = require('../util/gitignore');

module.exports = class Gitignore extends Generator {
  async writing() {
    const gitignoreFilename = this.destinationPath('.gitignore');
    if (!(await this.fs.exists(gitignoreFilename))) {
      await this.fs.write(gitignoreFilename, '');
    }
    const gitignoreContents = await this.fs.read(
      this.templatePath('node.gitignore')
    );
    const templateGitignore = gitignoreContents.split('\n');
    await this.updateFileContent(
      this.destinationPath('.gitignore'),
      (original) => {
        const originalLines = original.split('\n');
        return mergeGitignore(originalLines, templateGitignore).join('\n');
      }
    );
  }
};
