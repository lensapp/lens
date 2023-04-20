import { getInjectable } from "@ogre-tools/injectable";
import fse from "fs-extra";

export type CreateSymlink = (target: string, path: string, type: "dir" | "file") => Promise<void>;

export const createSymlinkInjectable = getInjectable({
  id: "create-symlink",
  instantiate: (): CreateSymlink => fse.symlink,
});
