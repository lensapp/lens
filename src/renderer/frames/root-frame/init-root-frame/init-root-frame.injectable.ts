/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { initRootFrame } from "./init-root-frame";
import extensionLoaderInjectable from "../../../../extensions/extension-loader/extension-loader.injectable";
import ipcRendererInjectable from "../../../app-paths/get-value-from-registered-channel/ipc-renderer/ipc-renderer.injectable";
import bindProtocolAddRouteHandlersInjectable from "../../../protocol-handler/bind-protocol-add-route-handlers/bind-protocol-add-route-handlers.injectable";
import lensProtocolRouterRendererInjectable from "../../../protocol-handler/lens-protocol-router-renderer/lens-protocol-router-renderer.injectable";
import catalogEntityRegistryInjectable from "../../../api/catalog/entity/registry.injectable";
import registerIpcListenersInjectable from "../../../ipc/register-ipc-listeners.injectable";

const initRootFrameInjectable = getInjectable({
  id: "init-root-frame",
  instantiate: (di) => initRootFrame({
    loadExtensions: di.inject(extensionLoaderInjectable).loadOnClusterManagerRenderer,
    registerIpcListeners: di.inject(registerIpcListenersInjectable),
    ipcRenderer: di.inject(ipcRendererInjectable),
    bindProtocolAddRouteHandlers: di.inject(bindProtocolAddRouteHandlersInjectable),
    lensProtocolRouterRenderer: di.inject(lensProtocolRouterRendererInjectable),
    catalogEntityRegistry: di.inject(catalogEntityRegistryInjectable),
  }),
});

export default initRootFrameInjectable;
