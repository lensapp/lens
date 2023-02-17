/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import joinPathsInjectable from "../../../../common/path/join-paths.injectable";
import extensionsNodeModulesDirectoryPathInjectable from "../common/extension-node-modules-directory-path.injectable";

export type GetExtensionInstallPath = (name: string) => string;

const getExtensionInstallPathInjectable = getInjectable({
  id: "get-extension-install-path",
  instantiate: (di): GetExtensionInstallPath => {
    const joinPaths = di.inject(joinPathsInjectable);
    const extensionsNodeModulesDirectoryPath = di.inject(extensionsNodeModulesDirectoryPathInjectable);

    return (name) => joinPaths(extensionsNodeModulesDirectoryPath, name);
  },
});

export default getExtensionInstallPathInjectable;
