const config = require("@k8slens/webpack").configForReact;

config.performance.maxEntrypointSize = 500000;
config.performance.maxAssetSize = 500000;

module.exports = config;
