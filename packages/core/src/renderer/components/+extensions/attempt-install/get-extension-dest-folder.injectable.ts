/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionDiscoveryInjectable from "../../../../extensions/extension-discovery/extension-discovery.injectable";
import { sanitizeExtensionName } from "../../../../extensions/lens-extension";
import path from "path";

export type GetExtensionDestFolder = (name: string) => string;

const getExtensionDestFolderInjectable = getInjectable({
  id: "get-extension-dest-folder",

  instantiate: (di): GetExtensionDestFolder => {
    const extensionDiscovery = di.inject(extensionDiscoveryInjectable);

    return (name) => path.join(extensionDiscovery.localFolderPath, sanitizeExtensionName(name));
  },
});

export default getExtensionDestFolderInjectable;
