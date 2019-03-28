const hostedGitInfo = require('hosted-git-info');

exports.normalizeRepository = function normalizeRepository(repo) {
  if (!repo) return null;
  if (typeof repo === 'string') return repo;
  return repo.url;
};

exports.getRepoHosting = function getRepoHosting(repo) {
  if (!repo) return null;
  return hostedGitInfo.fromUrl(repo);
};
