const config = require("@k8slens/jest").monorepoPackageConfig(__dirname).configForReact;

module.exports = { ...config, coverageThreshold: undefined };
