const { performance, ...configWithoutBundleSizeLimit } = require("@k8slens/webpack").configForNode;

module.exports = configWithoutBundleSizeLimit;
