const { configForReact } = require("@k8slens/jest").monorepoPackageConfig(__dirname);

module.exports = {
  ...configForReact,
  coverageThreshold: {
    global: {
      statements: 84,
      branches: 67,
      lines: 84,
      functions: 92,
    },
  },
};
