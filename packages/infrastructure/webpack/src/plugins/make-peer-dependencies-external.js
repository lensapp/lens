const ExternalModuleFactoryPlugin = require("webpack/lib/ExternalModuleFactoryPlugin");
const path = require("path");

const {
  toModuleMatcherRegExp,
} = require("./to-module-matcher-reg-exp/to-module-matcher-reg-exp");

class MakePeerDependenciesExternalPlugin {
  apply(compiler) {
    compiler.hooks.compile.tap("compile", (params) => {
      const peerDependencies = getPeerDependencies();

      new ExternalModuleFactoryPlugin(
        compiler.options.output.library.type,
        peerDependencies.map(toModuleMatcherRegExp)
      ).apply(params.normalModuleFactory);
    });
  }
}

const getPeerDependencies = () => {
  const pathToPackageJson = path.resolve(process.cwd(), "package.json");

  const packageJson = require(pathToPackageJson);

  return Object.keys(packageJson.peerDependencies || {});
};

module.exports = { MakePeerDependenciesExternalPlugin };
