const addBadge = require('../generators/util/add-badge');

describe('util/addBadge', () => {
  it('should add a badge', async () => {
    const markdown = `# generator-kennship

> Common tasks for new projects

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage percentage][coveralls-image]][coveralls-url]

More content

[npm-image]: https://badge.fury.io/js/generator-kennship.svg
[npm-url]: https://npmjs.org/package/generator-kennship
[coveralls-image]: https://coveralls.io/repos/ryaninvents/generator-kennship/badge.svg
[coveralls-url]: https://coveralls.io/r/ryaninvents/generator-kennship
`;
    const withBadge = await addBadge(markdown, {
      name: 'github-stars',
      altText: 'GitHub stars',
      imageUrl:
        'https://img.shields.io/github/stars/kennship/generator-kennship.svg?style=social',
      href: 'https://github.com/kennship/generator-kennship',
      priority: 25,
    });

    expect(withBadge).toMatchSnapshot();
  });
});
