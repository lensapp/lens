import { awaitAll } from "./await-all";
import { pipeline } from "@ogre-tools/fp";
import { map } from "lodash/fp";
import type { PackageJsonAndPath } from "./package-json-and-path";

import { getInjectable } from "@ogre-tools/injectable";
import { ensureEmptyDirectoryInjectable } from "./fs/ensure-empty-directory.injectable";
import { getLensLinkDirectoryInjectable } from "./get-lens-link-directory.injectable";

export type CreateLensLinkDirectories = (packageJsons: PackageJsonAndPath[]) => Promise<void>;

export const ensureEmptyLensLinkDirectoriesInjectable = getInjectable({
  id: "ensure-empty-lens-link-directories",

  instantiate: (di): CreateLensLinkDirectories => {
    const getLensLinkDirectory = di.inject(getLensLinkDirectoryInjectable);
    const ensureDirectory = di.inject(ensureEmptyDirectoryInjectable);

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
