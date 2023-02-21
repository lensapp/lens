/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import joinPathsInjectable from "../../../common/path/join-paths.injectable";

export type GetPathToLegacyPackageJson = (extensionName: string) => string;

const getPathToLegacyPackageJson = getInjectable({
  id: "get-path-to-legacy-package-json",

  instantiate: (di): GetPathToLegacyPackageJson => {
    const directoryForUserData = di.inject(directoryForUserDataInjectable);
    const joinPaths = di.inject(joinPathsInjectable);

    return (extensionName: string) => joinPaths(directoryForUserData, "node_modules", extensionName, "package.json");
  },
});

export default getPathToLegacyPackageJson;
