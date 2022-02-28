/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import extensionDiscoveryInjectable from "../../../../../extensions/extension-discovery/extension-discovery.injectable";

import { getExtensionDestFolder } from "./get-extension-dest-folder";

const getExtensionDestFolderInjectable = getInjectable({
  id: "get-extension-dest-folder",

  instantiate: (di) =>
    getExtensionDestFolder({
      extensionDiscovery: di.inject(extensionDiscoveryInjectable),
    }),
});

export default getExtensionDestFolderInjectable;
