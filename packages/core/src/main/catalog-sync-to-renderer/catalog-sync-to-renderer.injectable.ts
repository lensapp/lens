/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import ipcMainInjectionToken from "../../common/ipc/ipc-main-injection-token";
import { catalogInitChannel } from "../../common/ipc/catalog";
import { disposer } from "@k8slens/utilities";
import { getStartableStoppable } from "@k8slens/startable-stoppable";
import catalogEntityRegistryInjectable from "../catalog/entity-registry.injectable";
import catalogSyncBroadcasterInjectable from "./broadcaster.injectable";
import { toJS } from "../../common/utils";

const catalogSyncToRendererInjectable = getInjectable({
  id: "catalog-sync-to-renderer",

  instantiate: (di) => {
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
    const ipcMain = di.inject(ipcMainInjectionToken);
    const catalogSyncBroadcaster = di.inject(catalogSyncBroadcasterInjectable);

    return getStartableStoppable(
      "catalog-sync",
      () => {
        const initChannelHandler = () => catalogSyncBroadcaster(toJS(catalogEntityRegistry.items));

        ipcMain.on(catalogInitChannel, initChannelHandler);

        return disposer(
          () => ipcMain.off(catalogInitChannel, initChannelHandler),
          reaction(() => toJS(catalogEntityRegistry.items), (items) => {
            catalogSyncBroadcaster(items);
          }, {
            fireImmediately: true,
          }),
        );
      },
    );
  },
});

export default catalogSyncToRendererInjectable;
