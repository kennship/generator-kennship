const get = require('lodash/get');
const deepEqual = require('lodash/isEqual');

exports.getDockerImage = function getDockerImage(config, container) {
  const jobsHash = get(config, 'jobs', {});
  let match = container;
  Object.keys(jobsHash).some((key) => {
    const job = jobsHash[key];
    const jobContainer = get(job, 'docker');
    if (deepEqual(jobContainer, container)) {
      match = jobContainer;
      return true;
    }
    return false;
  });
  return match;
};
