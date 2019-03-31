const hostedGitInfo = require('hosted-git-info');
const H = require('haikunator').default;

const { haikunate } = new H();

exports.normalizeRepository = function normalizeRepository(repo) {
  if (!repo) return null;
  if (typeof repo === 'string') return repo;
  return repo.url;
};

exports.getRepoHosting = function getRepoHosting(repo) {
  if (!repo) return null;
  return hostedGitInfo.fromUrl(repo);
};

exports.suggestPackageName = () => haikunate();

exports.suggestDirectoryName = function suggestDirectoryName(packageName) {
  let split = packageName.split('/');
  if (split.length > 1) split = split.slice(1);
  return split.join('/').replace(/[^A-Za-z0-9-@.]+/g, '_');
};
