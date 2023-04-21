import { partition } from "lodash/fp";
import { dirname } from "path";
import { pipeline } from "@ogre-tools/fp";
import { flatten, map } from "lodash/fp";
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
import { globInjectable } from "./fs/glob.injectable";
import { awaitAll } from "./await-all";

export type LensLink = () => Promise<void>;

const shouldBeGlobbed = (possibleGlobString: string) => possibleGlobString.includes("*");

const simplifyGlobbing = new RegExp("(\\/\\*\\/\\*\\*|\\/\\*\\*|\\/\\*\\*\\/\\*|\\/\\*)$");
const toAvoidableGlobStrings = (reference: string) => reference.replace(simplifyGlobbing, "");

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
    const glob = di.inject(globInjectable);

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

      await pipeline(
        packageJsons,

        map(async ({ packageJsonPath, content }) => {
          const lensLinkDirectory = getLensLinkDirectory(content.name);

          const fileStrings = content.files.map(toAvoidableGlobStrings);

          const [toBeGlobbed, toNotBeGlobbed] = partition(shouldBeGlobbed)(fileStrings);

          const moduleDirectory = dirname(packageJsonPath);

          let globbeds: string[] = [];

          if (toBeGlobbed.length) {
            globbeds = await glob(toBeGlobbed, { cwd: moduleDirectory });
          }

          return [
            {
              target: packageJsonPath,
              source: resolvePath(lensLinkDirectory, "package.json"),
              type: "file" as const,
            },

            ...globbeds.map((fileString) => ({
              target: resolvePath(moduleDirectory, fileString),
              source: resolvePath(lensLinkDirectory, fileString),
              type: "file" as const,
            })),

            ...toNotBeGlobbed.map((fileOrDirectory) => ({
              target: resolvePath(moduleDirectory, fileOrDirectory),
              source: resolvePath(lensLinkDirectory, fileOrDirectory),
              type: "dir" as const,
            })),
          ];
        }),

        awaitAll,

        flatten,

        map(({ target, source, type }) => createSymlink(target, source, type)),

        awaitAll,
      );
    };
  },
});

export default lensLinkInjectable;
