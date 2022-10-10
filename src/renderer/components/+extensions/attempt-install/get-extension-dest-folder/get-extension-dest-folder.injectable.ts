/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import joinPathsInjectable from "../../../../../common/path/join-paths.injectable";
import extensionDiscoveryInjectable from "../../../../../extensions/extension-discovery/extension-discovery.injectable";
import { sanitizeExtensionName } from "../../../../../extensions/lens-extension";

export type GetExtensionDestFolder = (extensionName: string) => string;

const getExtensionDestFolderInjectable = getInjectable({
  id: "get-extension-dest-folder",

  instantiate: (di): GetExtensionDestFolder => {
    const extensionDiscovery = di.inject(extensionDiscoveryInjectable);
    const joinPaths = di.inject(joinPathsInjectable);

    return (name) => joinPaths(extensionDiscovery.localFolderPath, sanitizeExtensionName(name));
  },
});

export default getExtensionDestFolderInjectable;
