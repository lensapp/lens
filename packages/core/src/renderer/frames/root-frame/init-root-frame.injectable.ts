/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import bindProtocolAddRouteHandlersInjectable from "../../protocol-handler/bind-protocol-add-route-handlers/bind-protocol-add-route-handlers.injectable";
import lensProtocolRouterRendererInjectable from "../../protocol-handler/lens-protocol-router-renderer/lens-protocol-router-renderer.injectable";
import registerIpcListenersInjectable from "../../ipc/register-ipc-listeners.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import { delay } from "../../../common/utils";
import { broadcastMessage } from "../../../common/ipc";
import sendBundledExtensionsLoadedInjectable from "../../../features/extensions/loader/renderer/send-bundled-extensions-loaded.injectable";
import autoInitExtensionsInjectable from "../../../features/extensions/loader/common/auto-init-extensions.injectable";
import unmountRootComponentInjectable from "../../window/unmount-root-component.injectable";

const initRootFrameInjectable = getInjectable({
  id: "init-root-frame",
  instantiate: (di) => {
    const autoInitExtensions = di.inject(autoInitExtensionsInjectable);
    const registerIpcListeners = di.inject(registerIpcListenersInjectable);
    const bindProtocolAddRouteHandlers = di.inject(bindProtocolAddRouteHandlersInjectable);
    const lensProtocolRouterRenderer = di.inject(lensProtocolRouterRendererInjectable);
    const logger = di.inject(loggerInjectable);
    const sendBundledExtensionsLoaded = di.inject(sendBundledExtensionsLoadedInjectable);
    const unmountRootComponent = di.inject(unmountRootComponentInjectable);

    return async () => {
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

      lensProtocolRouterRenderer.init();

      bindProtocolAddRouteHandlers();

      window.addEventListener("offline", () =>
        broadcastMessage("network:offline"),
      );

      window.addEventListener("online", () => broadcastMessage("network:online"));

      registerIpcListeners();

      window.addEventListener("beforeunload", () => {
        logger.info("[ROOT-FRAME]: Unload app");
        unmountRootComponent();
      });
    };
  },
});

export default initRootFrameInjectable;
