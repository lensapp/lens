import type { GetLensLinkDirectory } from "./get-lens-link-directory";
import type { Exists, RemoveDirectory } from "./lens-link";
import { pipeline } from "@ogre-tools/fp";
import { map, filter } from "lodash/fp";
import type { PackageJsonAndPath } from "./ensure-lens-link-directories";
import { awaitAll } from "./await-all";

export type RemoveExistingLensLinkDirectories = (packageJsons: PackageJsonAndPath[]) => Promise<void>;

export const removeExistingLensLinkDirectoriesFor =
  (
    getLensLinkDirectory: GetLensLinkDirectory,
    exists: Exists,
    removeDirectory: RemoveDirectory,
  ): RemoveExistingLensLinkDirectories =>
  async (packageJsons) => {
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
