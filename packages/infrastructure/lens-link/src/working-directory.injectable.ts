import { getInjectable } from "@ogre-tools/injectable";

export const workingDirectoryInjectable = getInjectable({
  id: "working-directory",
  instantiate: () => process.cwd(),
});
