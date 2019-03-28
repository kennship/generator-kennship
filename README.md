# generator-kennship

> Common tasks for new projects

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Coverage percentage][coveralls-image]][coveralls-url]
[![CircleCI][circle-img]][circle-url]

## Running

We assume you have pre-installed [node.js](https://nodejs.org/) v10 or later.

We suggest using `npx` to run the generator:

```bash
npx -p yo -p generator-kennship yo kennship
```

It's true that this is slightly verbose, but running it this way will ensure that you have the latest version.

If you like, you can create a shell alias. Add this to your shell profile (either `~/.bashrc` or `~/.zshrc`):

```bash
alias kyo="npx -p yo -p generator-kennship yo"
```

## Generators

> Note: For brevity, these examples use the shell alias defined above.
>
> If you have not installed the shell alias, replace `kyo` with:
>
>     npx -p yo -p generator-kennship yo


### `code-style`

Installs and configures code style tools, such as ESLint and Prettier.

```bash
kyo kennship:code-style
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
[circle-img]: https://img.shields.io/circleci/project/github/kennship/generator-kennship/master.svg
[circle-url]: https://circleci.com/gh/kennship/generator-kennship
