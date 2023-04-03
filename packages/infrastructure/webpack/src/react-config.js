const path = require("path");
const getReactConfig = require("./get-react-config");

module.exports = getReactConfig()({
  entrypointFilePath: "./index.ts",
  outputDirectory: path.resolve(process.cwd(), "dist"),
});
