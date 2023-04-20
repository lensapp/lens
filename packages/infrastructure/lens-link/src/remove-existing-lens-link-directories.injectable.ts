import { pipeline } from "@ogre-tools/fp";
import { map, filter } from "lodash/fp";
import { awaitAll } from "./await-all";
import { getInjectable } from "@ogre-tools/injectable";
import { getLensLinkDirectoryInjectable } from "./get-lens-link-directory.injectable";
import { existsInjectable } from "./fs/exists.injectable";
import { removeDirectoryInjectable } from "./fs/remove-directory.injectable";
import type { PackageJsonAndPath } from "./package-json-and-path";

export type RemoveExistingLensLinkDirectories = (packageJsons: PackageJsonAndPath[]) => Promise<void>;

export const removeExistingLensLinkDirectoriesInjectable = getInjectable({
  id: "remove-existing-lens-link-directories",

  instantiate: (di): RemoveExistingLensLinkDirectories => {
    const getLensLinkDirectory = di.inject(getLensLinkDirectoryInjectable);
    const exists = di.inject(existsInjectable);
    const removeDirectory = di.inject(removeDirectoryInjectable);

    return async (packageJsons) => {
      await pipeline(
        packageJsons,

        map(async ({ content }) => {
          const lensLinkDirectory = getLensLinkDirectory(content.name);

          return {
            directory: lensLinkDirectory,
            exists: await exists(lensLinkDirectory),
          };
        }),

        awaitAll,

        filter(({ exists }) => exists),

        map(({ directory }) => removeDirectory(directory)),

        awaitAll,
      );
    };
  },
});
