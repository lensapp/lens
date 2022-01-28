/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { initRootFrame } from "./init-root-frame";
import extensionLoaderInjectable from "../../../../extensions/extension-loader/extension-loader.injectable";
import ipcRendererInjectable from "../../../app-paths/get-value-from-registered-channel/ipc-renderer/ipc-renderer.injectable";
import addInternalProtocolRouteHandlersInjectable from "../../../protocol-handler/bind-protocol-add-route-handlers/bind-protocol-add-route-handlers.injectable";
import lensProtocolRouterRendererInjectable from "../../../protocol-handler/lens-protocol-router-renderer/lens-protocol-router-renderer.injectable";
import catalogEntityRegistryInjectable from "../../../catalog/entity-registry.injectable";
import { bind } from "../../../utils";
import getClusterByIdInjectable from "../../../../common/cluster-store/get-cluster-by-id.injectable";

const initRootFrameInjectable = getInjectable({
  instantiate: (di) => bind(initRootFrame, null, {
    loadExtensions: di.inject(extensionLoaderInjectable).loadOnClusterManagerRenderer,
    ipcRenderer: di.inject(ipcRendererInjectable),
    bindProtocolAddRouteHandlers: di.inject(addInternalProtocolRouteHandlersInjectable),
    lensProtocolRouterRenderer: di.inject(lensProtocolRouterRendererInjectable),
    catalogEntityRegistry: di.inject(catalogEntityRegistryInjectable),
    getClusterById: di.inject(getClusterByIdInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default initRootFrameInjectable;
