/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";

import extensionDiscoveryInjectable from "../../../../../extensions/extension-discovery/extension-discovery.injectable";

import { getExtensionDestFolder } from "./get-extension-dest-folder";

const getExtensionDestFolderInjectable = getInjectable({
  instantiate: (di) =>
    getExtensionDestFolder({
      extensionDiscovery: di.inject(extensionDiscoveryInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default getExtensionDestFolderInjectable;
