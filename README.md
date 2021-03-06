# generator-kennship

> Common tasks for new projects

[![CircleCI][circleci-image]][circleci-url]
[![NPM version][npm-image]][npm-url]
[![GitHub repository][github-image]][github-url]
[![Build Status][travis-image]][travis-url]
[![Project issues][bugs-image]][bugs-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
[![Coverage percentage][coveralls-image]][coveralls-url]

## Running

We assume you have pre-installed [node.js](https://nodejs.org/) v10 or later.

We suggest using `npx` to run the generator:

```bash
npx generator-kennship
```

It's true that this is slightly verbose, but running it this way will ensure that you have the latest version.

If you like, you can create a shell alias. Add this to your shell profile (either `~/.bashrc` or `~/.zshrc`):

```bash
alias kyo="npx generator-kennship"
```

## Generators

### `code-style`

Installs and configures code style tools, such as ESLint and Prettier.

```bash
npx generator-kennship kn:code-style
```

### `circle-ci`

Sets up a default CircleCI configuration and contacts CircleCI to follow your project.

```bash
npx generator-kennship kn:circle-ci
```

### `pack`

Sets up [`@pika/pack`][pika-pack] for your project.

```bash
npx generator-kennship kn:pack
```

### `release`

Sets up Semantic Release for your project.

```bash
npx generator-kennship kn:release
```

### `gitignore`

Applies a default set of `.gitignore` rules to your project. Won't clobber your existing rules, and will try to keep related items together.

```bash
npx generator-kennship kn:gitignore
```

### `readme`

Creates a README.md for your project.

```bash
npx generator-kennship kn:readme
```

### Smaller generators

This package also includes several smaller generators so you can run them independently.

```bash
# Add a GitHub badge
npx generator-kennship kn:github-badge

# Add a badge for your bug tracker
npx generator-kennship kn:bugs

# Add an npm badge linking to your package at npmjs.com
npx generator-kennship kn:npm-public

# Add a badge to let users know that this repo is maintained
npx generator-kennship kn:maintained
```

## License

MIT © [Kennship](https://kennship.com)

[npm-image]: https://badge.fury.io/js/generator-kennship.svg

[npm-url]: https://npmjs.org/package/generator-kennship

[travis-image]: https://travis-ci.org/ryaninvents/generator-kennship.svg?branch=master

[travis-url]: https://travis-ci.org/ryaninvents/generator-kennship

[daviddm-image]: https://david-dm.org/ryaninvents/generator-kennship.svg?theme=shields.io

[daviddm-url]: https://david-dm.org/ryaninvents/generator-kennship

[coveralls-image]: https://coveralls.io/repos/ryaninvents/generator-kennship/badge.svg

[coveralls-url]: https://coveralls.io/r/ryaninvents/generator-kennship

[circleci-image]: https://img.shields.io/circleci/project/github/kennship/generator-kennship/master.svg?logo=circleci

[circleci-url]: https://circleci.com/gh/kennship/generator-kennship

[github-image]: https://img.shields.io/github/stars/kennship/generator-kennship.svg?style=social

[github-url]: https://github.com/kennship/generator-kennship

[bugs-image]: https://img.shields.io/github/issues/kennship/generator-kennship.svg?logo=github

[bugs-url]: https://github.com/kennship/generator-kennship/issues

[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg

[semantic-release-url]: https://github.com/semantic-release/semantic-release

[pika-pack]: https://www.pikapkg.com/docs/blog/introducing-pika-pack/
