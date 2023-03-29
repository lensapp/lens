const {
  configForNode: { performance, ...configForNode }
} = require("@k8slens/webpack");

module.exports = {
  ...configForNode,
  performance: {
    ...performance,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
}
