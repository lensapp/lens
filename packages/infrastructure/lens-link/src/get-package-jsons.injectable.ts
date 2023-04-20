import { awaitAll } from "./await-all";
import { pipeline } from "@ogre-tools/fp";
import { map } from "lodash/fp";
import type { PackageJson } from "./package-json-and-path";
import { getInjectable } from "@ogre-tools/injectable";
import { readJsonFileInjectable } from "./fs/read-json-file.injectable";

export const getPackageJsonsInjectable = getInjectable({
  id: "get-package-jsons",

  instantiate: (di) => {
    const readJsonFile = di.inject(readJsonFileInjectable);

    return async (packageJsonPaths: string[]) =>
      pipeline(
        packageJsonPaths,

        map(async (packageJsonPath) => ({
          packageJsonPath,
          content: (await readJsonFile(packageJsonPath)) as unknown as PackageJson,
        })),

        awaitAll,
      );
  },
});
