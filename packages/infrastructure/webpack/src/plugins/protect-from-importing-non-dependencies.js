const path = require("path");
const { getDependencyName } = require("./get-dependency-name/get-dependency-name");

const pathToPackageJson = path.resolve(process.cwd(), "package.json");

class ProtectFromImportingNonDependencies {
  apply(compiler) {
    const dependencies = getDependenciesAndPeerDependencies();

    const nodeModulesToBeResolved = new Set();

    compiler.hooks.normalModuleFactory.tap("irrelevant", (normalModuleFactory) => {
      normalModuleFactory.hooks.resolve.tap("irrelevant", (toBeResolved) => {

        const isLocalDependency = toBeResolved.request.startsWith(".");
        const isDependencyOfDependency =
          toBeResolved.context.includes("node_modules");

        if (!isLocalDependency && !isDependencyOfDependency) {

          const dependencyName = getDependencyName(toBeResolved.request);

          nodeModulesToBeResolved.add(dependencyName);
        }
      });
    });

    compiler.hooks.afterCompile.tap("compile", () => {
      const notSpecifiedDependencies = [...nodeModulesToBeResolved].filter(
        (x) => !dependencies.includes(x)
      );

      if (notSpecifiedDependencies.length) {
        throw new Error(
          `Tried to import dependencies that are not specified in the package.json "${pathToPackageJson}". Add "${notSpecifiedDependencies.join(
            '", "'
          )}" to dependencies or peerDependencies.`
        );
      }
    });
  }
}
const getDependenciesAndPeerDependencies = () => {
  const packageJson = require(pathToPackageJson);

  const dependencies = Object.keys(packageJson.dependencies || {});
  const peerDependencies = Object.keys(packageJson.peerDependencies || {});

  return [...dependencies, ...peerDependencies];
};

module.exports = {
  ProtectFromImportingNonDependencies,
};
