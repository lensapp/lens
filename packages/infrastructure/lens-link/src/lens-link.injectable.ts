import { ensureEmptyLensLinkDirectoriesInjectable } from "./ensure-empty-lens-link-directories.injectable";
import { getPackageJsonsInjectable } from "./get-package-jsons.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { createSymlinksInjectable } from "./create-symlinks.injectable";
import getConfigInjectable from "./get-config.injectable";
import createEmptyConfigInjectable from "./create-empty-config.injectable";

export type LensLink = () => Promise<void>;

const lensLinkInjectable = getInjectable({
  id: "lens-link",

  instantiate: (di): LensLink => {
    const getPackageJsons = di.inject(getPackageJsonsInjectable);
    const ensureEmptyLensLinkDirectories = di.inject(ensureEmptyLensLinkDirectoriesInjectable);
    const createSymlinks = di.inject(createSymlinksInjectable);
    const getConfig = di.inject(getConfigInjectable);
    const createEmptyConfig = di.inject(createEmptyConfigInjectable);

    return async () => {
      const config = await getConfig();

      if (!config) {
        await createEmptyConfig();

        return;
      }

      const packageJsons = await getPackageJsons(config);

      await ensureEmptyLensLinkDirectories(packageJsons);
      await createSymlinks(packageJsons);
    };
  },
});

export default lensLinkInjectable;
