import { getInjectable } from "@ogre-tools/injectable";
import fse from "fs-extra";

export type EnsureEmptyDirectory = (path: string) => Promise<void>;

export const ensureEmptyDirectoryInjectable = getInjectable({
  id: "ensure-empty-directory",
  instantiate: (): EnsureEmptyDirectory => fse.emptyDir,
});
