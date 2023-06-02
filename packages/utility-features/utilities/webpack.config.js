const config = require("@k8slens/webpack").configForNode;

config.performance.maxEntrypointSize = 300000

module.exports = config;
