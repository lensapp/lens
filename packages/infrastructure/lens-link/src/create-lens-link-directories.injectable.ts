import { awaitAll } from "./await-all";
import { pipeline } from "@ogre-tools/fp";
import { map } from "lodash/fp";
import type { PackageJsonAndPath } from "./package-json-and-path";

import { getInjectable } from "@ogre-tools/injectable";
import { ensureDirectoryInjectable } from "./fs/ensure-directory.injectable";
import { getLensLinkDirectoryInjectable } from "./get-lens-link-directory.injectable";

export type CreateLensLinkDirectories = (packageJsons: PackageJsonAndPath[]) => Promise<void>;

export const createLensLinkDirectoriesInjectable = getInjectable({
  id: "create-lens-link-directories",

  instantiate: (di): CreateLensLinkDirectories => {
    const getLensLinkDirectory = di.inject(getLensLinkDirectoryInjectable);
    const ensureDirectory = di.inject(ensureDirectoryInjectable);

    return async (packageJsons: PackageJsonAndPath[]) => {
      await pipeline(
        packageJsons,
        map(({ content: { name } }) => getLensLinkDirectory(name)),
        map(ensureDirectory),
        awaitAll,
      );
    };
  },
});
