import { map } from "lodash/fp";
import { awaitAll } from "./await-all";
import { getInjectable } from "@ogre-tools/injectable";
import { pipeline } from "@ogre-tools/fp";
import { createSymlinkInjectable } from "./fs/create-symlink.injectable";

export const createSymLinksInjectable = getInjectable({
  id: "create-sym-links",

  instantiate: (di) => {
    const createSymlink = di.inject(createSymlinkInjectable);

    return async (symlinkPaths: { target: string; source: string; type: "file" | "dir" }[]) => {
      await pipeline(
        symlinkPaths,
        map(({ target, source, type }) => createSymlink(target, source, type)),
        awaitAll,
      );
    };
  },
});
