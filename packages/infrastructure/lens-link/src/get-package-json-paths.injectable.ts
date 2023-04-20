import { getInjectable } from "@ogre-tools/injectable";
import { resolvePathInjectable } from "./path/resolve-path.injectable";
import { workingDirectoryInjectable } from "./working-directory.injectable";
import { readJsonFileInjectable } from "./fs/read-json-file.injectable";

export const getPackageJsonPathsInjectable = getInjectable({
  id: "get-package-json-paths",

  instantiate: (di) => {
    const readJsonFile = di.inject(readJsonFileInjectable);
    const resolvePath = di.inject(resolvePathInjectable);
    const workingDirectory = di.inject(workingDirectoryInjectable);

    return async (configFilePath: string) => {
      const configFile = (await readJsonFile(configFilePath)) as string[];

      return configFile.map((linkPath: string) => resolvePath(workingDirectory, linkPath, "package.json"));
    };
  },
});
