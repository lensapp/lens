const { configForNode } =
  require("@k8slens/jest").monorepoPackageConfig(__dirname);

module.exports = {
  ...configForNode,

  collectCoverageFrom: [...configForNode.collectCoverageFrom],
};
