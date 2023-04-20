import { getInjectable } from "@ogre-tools/injectable";
import { workingDirectoryInjectable } from "./working-directory.injectable";
import { resolvePathInjectable } from "./path/resolve-path.injectable";

export const getLensLinkDirectoryInjectable = getInjectable({
  id: "get-lens-link-directory",

  instantiate: (di) => {
    const resolvePath = di.inject(resolvePathInjectable);
    const workingDirectory = di.inject(workingDirectoryInjectable);

    return (moduleName: string) => resolvePath(workingDirectory, "node_modules", moduleName);
  },
});
