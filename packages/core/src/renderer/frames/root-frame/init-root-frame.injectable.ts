/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import bindProtocolAddRouteHandlersInjectable from "../../protocol-handler/bind-protocol-add-route-handlers/bind-protocol-add-route-handlers.injectable";
import lensProtocolRouterRendererInjectable from "../../protocol-handler/lens-protocol-router-renderer/lens-protocol-router-renderer.injectable";
import registerIpcListenersInjectable from "../../ipc/register-ipc-listeners.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import unmountRootComponentInjectable from "../../window/unmount-root-component.injectable";

const initRootFrameInjectable = getInjectable({
  id: "init-root-frame",
  instantiate: (di) => {
    const registerIpcListeners = di.inject(registerIpcListenersInjectable);
    const bindProtocolAddRouteHandlers = di.inject(bindProtocolAddRouteHandlersInjectable);
    const lensProtocolRouterRenderer = di.inject(lensProtocolRouterRendererInjectable);
    const logger = di.inject(loggerInjectable);
    const unmountRootComponent = di.inject(unmountRootComponentInjectable);

    return async () => {
      lensProtocolRouterRenderer.init();

      bindProtocolAddRouteHandlers();
      registerIpcListeners();

      window.addEventListener("beforeunload", () => {
        logger.info("[ROOT-FRAME]: Unload app");
        unmountRootComponent();
      });
    };
  },
});

export default initRootFrameInjectable;
