/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import ipcRendererInjectable from "../../utils/channel/ipc-renderer.injectable";
import bindProtocolAddRouteHandlersInjectable from "../../protocol-handler/bind-protocol-add-route-handlers/bind-protocol-add-route-handlers.injectable";
import lensProtocolRouterRendererInjectable from "../../protocol-handler/lens-protocol-router-renderer/lens-protocol-router-renderer.injectable";
import catalogEntityRegistryInjectable from "../../api/catalog/entity/registry.injectable";
import registerIpcListenersInjectable from "../../ipc/register-ipc-listeners.injectable";
import loadExtensionsInjectable from "../load-extensions.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import { delay } from "../../../common/utils";
import { broadcastMessage } from "../../../common/ipc";
import { bundledExtensionsLoaded } from "../../../common/ipc/extension-handling";

const initRootFrameInjectable = getInjectable({
  id: "init-root-frame",
  instantiate: (di) => {
    const loadExtensions = di.inject(loadExtensionsInjectable);
    const registerIpcListeners = di.inject(registerIpcListenersInjectable);
    const ipcRenderer = di.inject(ipcRendererInjectable);
    const bindProtocolAddRouteHandlers = di.inject(bindProtocolAddRouteHandlersInjectable);
    const lensProtocolRouterRenderer = di.inject(lensProtocolRouterRendererInjectable);
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
    const logger = di.inject(loggerInjectable);

    return async (unmountRoot: () => void) => {
      catalogEntityRegistry.init();

      try {
        // maximum time to let bundled extensions finish loading
        const timeout = delay(10000);

        const loadingExtensions = await loadExtensions();

        const loadingBundledExtensions = loadingExtensions
          .filter((e) => e.isBundled)
          .map((e) => e.loaded);

        const bundledExtensionsFinished = Promise.all(loadingBundledExtensions);

        await Promise.race([bundledExtensionsFinished, timeout]);
      } finally {
        ipcRenderer.send(bundledExtensionsLoaded);
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

        unmountRoot();
      });
    };
  },
});

export default initRootFrameInjectable;
