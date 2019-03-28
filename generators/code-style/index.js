const get = require('lodash/get');
const defaults = require('lodash/defaults');
const Generator = require('../util/base');

const CODE_STYLE_DEPENDENCIES = {
  eslint: '^5.13.0',
  'eslint-config-prettier': '^3.3.0',
  'eslint-config-xo': '^0.25.0',
  'eslint-plugin-prettier': '^3.0.0',
  'lint-staged': '^8.1.0',
  prettier: '^1.15.2',
};

const RuntimeEnv = {
  Browser: 'browser',
  Node: 'node',
  Universal: 'universal',
};

function generateCodeStyleConfig({ projectType = RuntimeEnv.Node } = {}) {
  let baseEnv = {};

  if (projectType === RuntimeEnv.Node || projectType === RuntimeEnv.Universal) {
    baseEnv.node = true;
  }
  if (
    projectType === RuntimeEnv.Browser ||
    projectType === RuntimeEnv.Universal
  ) {
    baseEnv.browser = true;
  }

  return {
    eslintConfig: {
      extends: ['xo', 'prettier'],
      ...(baseEnv ? { env: baseEnv } : null),
      rules: {
        'prettier/prettier': 'error',
        'func-names': 'off',
      },
      plugins: ['prettier'],
      overrides: [
        {
          files: ['**/__tests__/**', '*.test.js'],
          env: {
            jest: true,
          },
        },
      ],
    },
    prettier: {
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
      arrowParens: 'always',
    },
  };
}

module.exports = class CodeStyle extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option('projectType', {
      type: String,
      desc: 'One of (node, browser, universal)',
      required: false,
    });
  }

  async prompting() {
    const responses = await this.prompt([
      {
        name: 'projectType',
        message: 'What type of project is this?',
        when: !this.options.projectType,
        type: 'list',
        choices: [
          {
            name: 'Browser',
            value: RuntimeEnv.Browser,
          },
          {
            name: 'Node',
            value: RuntimeEnv.Node,
          },
          {
            name: 'Universal',
            value: RuntimeEnv.Universal,
          },
        ],
      },
    ]);
    defaults(this.options, responses);
  }

  async writing() {
    await this.updatePackageJson((pkg) => ({
      ...pkg,
      scripts: {
        lint: "eslint 'src/**/*.js'",
        pretest: 'npm run -s lint',
        ...get(pkg, 'scripts', {}),
      },
      devDependencies: {
        ...CODE_STYLE_DEPENDENCIES,
        ...get(pkg, 'devDependencies', {}),
      },
      ...generateCodeStyleConfig({ projectType: this.options.projectType }),
    }));
    await this.fs.copy(
      this.templatePath('editorconfig.ini'),
      this.destinationPath('.editorconfig')
    );
  }

  async installing() {
    this.npmInstall();
  }
};
