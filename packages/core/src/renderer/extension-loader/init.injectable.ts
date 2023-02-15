/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../extensions/extension-loader/extension-loader.injectable";
import { beforeFrameStartsSecondInjectionToken } from "../before-frame-starts/tokens";

const initializeExtensionLoaderInjectable = getInjectable({
  id: "initialize-extension-loader",
  instantiate: (di) => ({
    id: "initialize-extension-loader",
    run: async () => {
      const extensionLoader = di.inject(extensionLoaderInjectable);

      await extensionLoader.init();
    },
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default initializeExtensionLoaderInjectable;
