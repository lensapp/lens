const config = require("@k8slens/jest").monorepoPackageConfig(__dirname).configForNode;

module.exports = { ...config, coverageThreshold: undefined };
