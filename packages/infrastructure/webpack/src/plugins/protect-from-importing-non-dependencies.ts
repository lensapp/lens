import path from "path";
import { getDependencyName } from "./get-dependency-name/get-dependency-name";
import { readJsonSync } from "fs-extra";

const pathToPackageJson = path.resolve(process.cwd(), "package.json");

export class ProtectFromImportingNonDependencies {
  apply(compiler: any) {
    const dependencies = getDependenciesAndPeerDependencies();

    const nodeModulesToBeResolved = new Set();

    compiler.hooks.normalModuleFactory.tap(
      "irrelevant",
      (normalModuleFactory: any) => {
        normalModuleFactory.hooks.resolve.tap(
          "irrelevant",
          (toBeResolved: any) => {
            const isSassDependency = toBeResolved.request.endsWith(".scss");
            const isLocalDependency = toBeResolved.request.startsWith(".");
            const isDependencyOfDependency =
              toBeResolved.context.includes("node_modules");

            const dependencyName = getDependencyName(toBeResolved.request);

            const dependencyWeAreInterested =
              !isSassDependency &&
              !isLocalDependency &&
              !isDependencyOfDependency &&
              dependencyName;

            if (dependencyWeAreInterested) {
              nodeModulesToBeResolved.add(dependencyName);
            }
          }
        );
      }
    );

    compiler.hooks.afterCompile.tap("compile", () => {
      const notSpecifiedDependencies = [...nodeModulesToBeResolved].filter(
        (x: any) => !dependencies.includes(x)
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
  const packageJson = readJsonSync(pathToPackageJson);

  const dependencies = Object.keys(packageJson.dependencies || {});
  const peerDependencies = Object.keys(packageJson.peerDependencies || {});

  return [...dependencies, ...peerDependencies];
};
