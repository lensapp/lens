import { map } from "lodash/fp";
import { awaitAll } from "./await-all";
import { getInjectable } from "@ogre-tools/injectable";
import { pipeline } from "@ogre-tools/fp";
import { createSymlinkInjectable } from "./fs/create-symlink.injectable";
import type { PackageJsonAndPath } from "./package-json-and-path";
import { getSymlinkPathsInjectable } from "./get-symlink-paths.injectable";

export const createSymlinksInjectable = getInjectable({
  id: "create-symlinks",

  instantiate: (di) => {
    const getSymlinkPaths = di.inject(getSymlinkPathsInjectable);
    const createSymlink = di.inject(createSymlinkInjectable);

    return async (packageJsons: PackageJsonAndPath[]) => {
      await pipeline(
        packageJsons,
        getSymlinkPaths,
        map(({ target, source, type }) => createSymlink(target, source, type)),
        awaitAll,
      );
    };
  },
});
