/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { LensExtensionId } from "@k8slens/legacy-extensions";
import { getInjectable } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../../extensions/extension-loader/extension-loader.injectable";

export type EnableExtension = (extId: LensExtensionId) => void;

const enableExtensionInjectable = getInjectable({
  id: "enable-extension",

  instantiate: (di): EnableExtension => {
    const extensionLoader = di.inject(extensionLoaderInjectable);

    return (extId) => {
      const ext = extensionLoader.getExtensionById(extId);

      if (ext && !ext.isBundled) {
        ext.isEnabled = true;
      }
    };
  },
});

export default enableExtensionInjectable;
