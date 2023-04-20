import { getInjectable } from "@ogre-tools/injectable";
import fse from "fs-extra";

export type EnsureDirectory = (path: string) => Promise<void>;

export const ensureDirectoryInjectable = getInjectable({
  id: "ensure-directory",
  instantiate: (): EnsureDirectory => fse.ensureDir,
});
