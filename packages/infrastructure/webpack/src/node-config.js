const path = require("path");
const getNodeConfig = require("./get-node-config");

module.exports = getNodeConfig({
  entrypointFilePath: "./index.ts",
  outputDirectory: path.resolve(process.cwd(), "dist"),
});
