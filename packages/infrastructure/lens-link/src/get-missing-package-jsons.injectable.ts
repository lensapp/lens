import { pipeline } from "@ogre-tools/fp";
import { map, filter } from "lodash/fp";
import { awaitAll } from "./await-all";
import { getInjectable } from "@ogre-tools/injectable";
import { existsInjectable } from "./fs/exists.injectable";

export const getMissingPackageJsonsInjectable = getInjectable({
  id: "get-missing-package-jsons",

  instantiate: (di) => {
    const exists = di.inject(existsInjectable);

    return async (packageJsonPaths: string[]) =>
      pipeline(
        packageJsonPaths,

        map(async (packageJsonPath) => ({
          packageJsonPath,
          exists: await exists(packageJsonPath),
        })),

        awaitAll,
        filter(({ exists }) => !exists),
        map(({ packageJsonPath }) => packageJsonPath),
      );
  },
});
