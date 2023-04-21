import { getInjectable } from "@ogre-tools/injectable";
import { resolvePathInjectable } from "./path/resolve-path.injectable";
import { workingDirectoryInjectable } from "./working-directory.injectable";

const configFilePathInjectable = getInjectable({
  id: "config-file-path",

  instantiate: (di) => {
    const resolvePath = di.inject(resolvePathInjectable);
    const workingDirectory = di.inject(workingDirectoryInjectable);

    return resolvePath(workingDirectory, ".lens-links.json");
  },
});

export default configFilePathInjectable;
