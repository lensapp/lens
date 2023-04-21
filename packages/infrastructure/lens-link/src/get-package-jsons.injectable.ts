import { awaitAll } from "./await-all";
import { pipeline } from "@ogre-tools/fp";
import { map } from "lodash/fp";
import type { PackageJson } from "./package-json-and-path";
import { getInjectable } from "@ogre-tools/injectable";
import { readJsonFileInjectable } from "./fs/read-json-file.injectable";
import { getPackageJsonPathsInjectable } from "./get-package-json-paths.injectable";
import { checkForMissingPackageJsonsInjectable } from "./check-for-missing-package-jsons.injectable";
import type { Config } from "./get-config.injectable";

export const getPackageJsonsInjectable = getInjectable({
  id: "get-package-jsons",

  instantiate: (di) => {
    const readJsonFile = di.inject(readJsonFileInjectable);
    const getPackageJsonPaths = di.inject(getPackageJsonPathsInjectable);
    const checkForMissingPackageJsons = di.inject(checkForMissingPackageJsonsInjectable);

    return async (config: Config) => {
      const packageJsonPaths = await getPackageJsonPaths(config);

      await checkForMissingPackageJsons(packageJsonPaths);

      return pipeline(
        packageJsonPaths,

        map(async (packageJsonPath) => ({
          packageJsonPath,
          content: (await readJsonFile(packageJsonPath)) as unknown as PackageJson,
        })),

        awaitAll,
      );
    };
  },
});
