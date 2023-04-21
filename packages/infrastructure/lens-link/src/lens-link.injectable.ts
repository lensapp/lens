import { removeExistingLensLinkDirectoriesInjectable } from "./remove-existing-lens-link-directories.injectable";
import { createLensLinkDirectoriesInjectable } from "./create-lens-link-directories.injectable";
import { getPackageJsonsInjectable } from "./get-package-jsons.injectable";
import { getPackageJsonPathsInjectable } from "./get-package-json-paths.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { resolvePathInjectable } from "./path/resolve-path.injectable";
import { existsInjectable } from "./fs/exists.injectable";
import { writeJsonFileInjectable } from "./fs/write-json-file.injectable";
import { workingDirectoryInjectable } from "./working-directory.injectable";
import { getSymlinkPathsInjectable } from "./get-symlink-paths.injectable";
import { createSymLinksInjectable } from "./create-sym-links.injectable";
import { checkForMissingPackageJsonsInjectable } from "./check-for-missing-package-jsons.injectable";

export type LensLink = () => Promise<void>;

const lensLinkInjectable = getInjectable({
  id: "lens-link",

  instantiate: (di): LensLink => {
    const getPackageJsons = di.inject(getPackageJsonsInjectable);
    const removeExistingLensLinkDirectories = di.inject(removeExistingLensLinkDirectoriesInjectable);
    const createLensLinkDirectories = di.inject(createLensLinkDirectoriesInjectable);
    const getPackageJsonPaths = di.inject(getPackageJsonPathsInjectable);
    const resolvePath = di.inject(resolvePathInjectable);
    const exists = di.inject(existsInjectable);
    const writeJsonFile = di.inject(writeJsonFileInjectable);
    const workingDirectory = di.inject(workingDirectoryInjectable);
    const getSymlinkPaths = di.inject(getSymlinkPathsInjectable);
    const createSymLinks = di.inject(createSymLinksInjectable);
    const checkForMissingPackageJsons = di.inject(checkForMissingPackageJsonsInjectable);

    return async () => {
      const configFilePath = resolvePath(workingDirectory, ".lens-links.json");

      const configFileExists = await exists(configFilePath);

      if (!configFileExists) {
        await writeJsonFile(configFilePath, []);

        return;
      }

      const packageJsonPaths = await getPackageJsonPaths(configFilePath);

      await checkForMissingPackageJsons(packageJsonPaths);

      const packageJsons = await getPackageJsons(packageJsonPaths);

      await removeExistingLensLinkDirectories(packageJsons);

      await createLensLinkDirectories(packageJsons);

      const symlinkPaths = await getSymlinkPaths(packageJsons);

      await createSymLinks(symlinkPaths);
    };
  },
});

export default lensLinkInjectable;
