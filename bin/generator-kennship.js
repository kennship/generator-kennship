#!/usr/bin/env node
const { argv } = process;
argv.slice(2).forEach((arg, shortIndex) => {
  const index = shortIndex + 2;
  if (index === 2 && arg === 'kn') {
    argv[index] = 'kennship';
    return;
  }
  if (arg.startsWith('kn:')) {
    argv[index] = arg.replace(/^kn:/, 'kennship:');
  }
});
require('yo/lib/cli');
