/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import ipcMainInjectionToken from "../../common/ipc/ipc-main-injection-token";
import { catalogInitChannel } from "../../common/ipc/catalog";
import { disposer, toJS } from "../../common/utils";
import { getStartableStoppable } from "../../common/utils/get-startable-stoppable";
import catalogEntityRegistryInjectable from "../catalog/entity-registry.injectable";
import broadcastCurrentCatalogEntityRegistryStateInjectable from "../../features/catalog/entities-sync/main/broadcast.injectable";

const catalogSyncToRendererInjectable = getInjectable({
  id: "catalog-sync-to-renderer",

  instantiate: (di) => {
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
    const ipcMain = di.inject(ipcMainInjectionToken);
    const broadcastCurrentCatalogEntityRegistryState = di.inject(broadcastCurrentCatalogEntityRegistryStateInjectable);

    return getStartableStoppable(
      "catalog-sync",
      () => {
        const initChannelHandler = () => broadcastCurrentCatalogEntityRegistryState(toJS(catalogEntityRegistry.items));

        ipcMain.on(catalogInitChannel, initChannelHandler);

        return disposer(
          () => ipcMain.off(catalogInitChannel, initChannelHandler),
          reaction(() => toJS(catalogEntityRegistry.items), (items) => {
            broadcastCurrentCatalogEntityRegistryState(items);
          }, {
            fireImmediately: true,
          }),
        );
      },
    );
  },
});

export default catalogSyncToRendererInjectable;
