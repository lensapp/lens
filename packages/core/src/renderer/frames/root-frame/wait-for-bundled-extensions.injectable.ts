/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { delay } from "../../../common/utils";
import autoInitExtensionsInjectable from "../../../features/extensions/loader/common/auto-init-extensions.injectable";
import sendBundledExtensionsLoadedInjectable from "../../../features/extensions/loader/renderer/send-bundled-extensions-loaded.injectable";
import { beforeMainFrameStartsSecondInjectionToken } from "../../before-frame-starts/tokens";

const waitForBundledExtensionsInjectable = getInjectable({
  id: "wait-for-bundled-extensions",
  instantiate: (di) => ({
    id: "wait-for-bundled-extensions",
    run: async () => {
      const autoInitExtensions = di.inject(autoInitExtensionsInjectable);
      const sendBundledExtensionsLoaded = di.inject(sendBundledExtensionsLoadedInjectable);

      try {
        // maximum time to let bundled extensions finish loading
        const timeout = delay(10000);

        const loadingExtensions = await autoInitExtensions();

        const loadingBundledExtensions = loadingExtensions
          .filter((e) => e.isBundled)
          .map((e) => e.loaded);

        const bundledExtensionsFinished = Promise.all(loadingBundledExtensions);

        await Promise.race([bundledExtensionsFinished, timeout]);
      } finally {
        sendBundledExtensionsLoaded();
      }
    },
  }),
  injectionToken: beforeMainFrameStartsSecondInjectionToken,
});

export default waitForBundledExtensionsInjectable;
