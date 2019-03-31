const { mergeGitignore } = require('../generators/util/gitignore');

describe('util/gitignore', () => {
  it('should merge two configs', () => {
    const original = `
yourfile.txt
myfile.txt

# npm
node_modules
*.log
npm-debug.log*

# editors
*.sw*`.split('\n');

    const newRules = `
myfile.txt
ourfile.txt

# terraform
.terraform
*.tfstate
*.tfvars

# editors
.*~

# assorted
node_modules
.npm`.split('\n');

    const result = mergeGitignore(original, newRules).join('\n');
    expect(result).toMatchSnapshot();
  });
});
