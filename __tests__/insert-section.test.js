const insertSection = require('../generators/util/insert-section');

describe('util/insert-section', () => {
  it('should insert a new section', async () => {
    const markdown = `# generator-kennship

> Common tasks for new projects

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage percentage][coveralls-image]][coveralls-url]

## Installation

Details on installing.

## Usage

Details on usage.

[npm-image]: https://badge.fury.io/js/generator-kennship.svg
[npm-url]: https://npmjs.org/package/generator-kennship
[coveralls-image]: https://coveralls.io/repos/ryaninvents/generator-kennship/badge.svg
[coveralls-url]: https://coveralls.io/r/ryaninvents/generator-kennship
`;
    const newSection = `## New section\n\nMore details for you.`;
    const updatedReadme = await insertSection(markdown, newSection, {
      priority: 50,
    });

    expect(updatedReadme).toMatchSnapshot();
  });

  it('should behave well in a mostly-empty README', async () => {
    const markdown = `# generator-kennship

> Common tasks for new projects

`;
    const newSection = `## New section\n\nMore details for you.`;
    const updatedReadme = await insertSection(markdown, newSection, {
      priority: 50,
    });

    expect(updatedReadme).toMatchSnapshot();
  });
});
