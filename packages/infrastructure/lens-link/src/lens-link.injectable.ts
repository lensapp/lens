import { dirname } from "path";
import { pipeline } from "@ogre-tools/fp";
import { flatMap, map } from "lodash/fp";
import { removeExistingLensLinkDirectoriesInjectable } from "./remove-existing-lens-link-directories.injectable";
import { createLensLinkDirectoriesInjectable } from "./create-lens-link-directories.injectable";
import { getMissingPackageJsonsInjectable } from "./get-missing-package-jsons.injectable";
import { getPackageJsonsInjectable } from "./get-package-jsons.injectable";
import { getPackageJsonPathsInjectable } from "./get-package-json-paths.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { getLensLinkDirectoryInjectable } from "./get-lens-link-directory.injectable";
import { resolvePathInjectable } from "./path/resolve-path.injectable";
import { existsInjectable } from "./fs/exists.injectable";
import { writeJsonFileInjectable } from "./fs/write-json-file.injectable";
import { createSymlinkInjectable } from "./fs/create-symlink.injectable";
import { workingDirectoryInjectable } from "./working-directory.injectable";

export type LensLink = () => Promise<void>;

const lensLinkInjectable = getInjectable({
  id: "lens-link",

  instantiate: (di): LensLink => {
    const getPackageJsons = di.inject(getPackageJsonsInjectable);
    const getLensLinkDirectory = di.inject(getLensLinkDirectoryInjectable);
    const getMissingPackageJsons = di.inject(getMissingPackageJsonsInjectable);
    const removeExistingLensLinkDirectories = di.inject(removeExistingLensLinkDirectoriesInjectable);
    const createLensLinkDirectories = di.inject(createLensLinkDirectoriesInjectable);
    const getPackageJsonPaths = di.inject(getPackageJsonPathsInjectable);
    const resolvePath = di.inject(resolvePathInjectable);
    const exists = di.inject(existsInjectable);
    const writeJsonFile = di.inject(writeJsonFileInjectable);
    const createSymlink = di.inject(createSymlinkInjectable);
    const workingDirectory = di.inject(workingDirectoryInjectable);

    return async () => {
      const configFilePath = resolvePath(workingDirectory, ".lens-links.json");

      const configFileExists = await exists(configFilePath);

      if (!configFileExists) {
        await writeJsonFile(configFilePath, []);

        return;
      }

      const packageJsonPaths = await getPackageJsonPaths(configFilePath);

      const missingPackageJsons = await getMissingPackageJsons(packageJsonPaths);

      if (missingPackageJsons.length) {
        throw new Error(
          `Tried to install Lens links, but configured package.jsons were not found: "${missingPackageJsons.join(
            '", "',
          )}".`,
        );
      }

      const packageJsons = await getPackageJsons(packageJsonPaths);

      await removeExistingLensLinkDirectories(packageJsons);

      await createLensLinkDirectories(packageJsons);

      pipeline(
        packageJsons,

        flatMap(({ packageJsonPath, content }) => {
          const lensLinkDirectory = getLensLinkDirectory(content.name);

          return [
            {
              target: packageJsonPath,
              source: resolvePath(lensLinkDirectory, "package.json"),
              type: "file" as const,
            },

            ...content.files.map((x) => ({
              target: resolvePath(dirname(packageJsonPath), x),
              source: resolvePath(lensLinkDirectory, x),
              type: "dir" as const,
            })),
          ];
        }),

        map(({ target, source, type }) => createSymlink(target, source, type)),
      );
    };
  },
});

export default lensLinkInjectable;
