import { getInjectable } from "@ogre-tools/injectable";
import fse from "fs-extra";

export type RemoveDirectory = (path: string) => Promise<void>;

export const removeDirectoryInjectable = getInjectable({
  id: "remove-directory",
  instantiate: (): RemoveDirectory => fse.remove,
});
