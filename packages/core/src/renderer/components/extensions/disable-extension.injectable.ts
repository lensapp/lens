/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { LensExtensionId } from "@k8slens/legacy-extensions";
import { getInjectable } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../../extensions/extension-loader/extension-loader.injectable";

export type DisableExtension = (extId: LensExtensionId) => void;

const disableExtensionInjectable = getInjectable({
  id: "disable-extension",

  instantiate: (di): DisableExtension => {
    const extensionLoader = di.inject(extensionLoaderInjectable);

    return (extId) => {
      const ext = extensionLoader.getExtensionById(extId);

      if (ext && !ext.isBundled) {
        ext.isEnabled = false;
      }
    };
  },
});

export default disableExtensionInjectable;
