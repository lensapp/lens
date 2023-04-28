const {
  configForNode: { coverageThreshold, ...config },
} = require("@k8slens/jest").monorepoPackageConfig(__dirname);

module.exports = config;
