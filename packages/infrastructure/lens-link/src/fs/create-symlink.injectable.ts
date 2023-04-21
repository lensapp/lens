import { getInjectable } from "@ogre-tools/injectable";
import fse from "fs-extra";
import { dirname } from "path";

export type CreateSymlink = (target: string, path: string, type: "dir" | "file") => Promise<void>;

export const createSymlinkInjectable = getInjectable({
  id: "create-symlink",

  instantiate: (): CreateSymlink => async (target, path, type) => {
    await fse.ensureDir(dirname(path));

    return fse.symlink(target, path, type);
  },
});
