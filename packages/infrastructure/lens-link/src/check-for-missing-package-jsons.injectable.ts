import { getInjectable } from "@ogre-tools/injectable";
import { getMissingPackageJsonsInjectable } from "./get-missing-package-jsons.injectable";

export const checkForMissingPackageJsonsInjectable = getInjectable({
  id: "check-for-missing-package-jsons",

  instantiate: (di) => {
    const getMissingPackageJsons = di.inject(getMissingPackageJsonsInjectable);

    return async (packageJsonPaths: string[]) => {
      const missingPackageJsons = await getMissingPackageJsons(packageJsonPaths);

      if (missingPackageJsons.length) {
        throw new Error(
          `Tried to install Lens links, but configured package.jsons were not found: "${missingPackageJsons.join(
            '", "',
          )}".`,
        );
      }
    };
  },
});
