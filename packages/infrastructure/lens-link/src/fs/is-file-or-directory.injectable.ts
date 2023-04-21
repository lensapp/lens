import { getInjectable } from "@ogre-tools/injectable";
import fse from "fs-extra";

export type IsFileOrDirectory = (path: string) => Promise<"file" | "dir">;

export const isFileOrDirectoryInjectable = getInjectable({
  id: "is-file-or-directory",

  instantiate: (): IsFileOrDirectory => async (path: string) => {
    const stat = await fse.stat(path);

    return stat.isDirectory() ? "dir" : "file";
  },
});
