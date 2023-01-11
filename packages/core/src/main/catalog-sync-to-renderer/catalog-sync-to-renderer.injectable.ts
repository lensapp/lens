/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import { catalogInitChannel } from "../../common/ipc/catalog";
import { disposer, toJS } from "../../common/utils";
import { getStartableStoppable } from "../../common/utils/get-startable-stoppable";
import catalogEntityRegistryInjectable from "../catalog/entity-registry.injectable";
import ipcMainInjectable from "../utils/channel/ipc-main/ipc-main.injectable";
import catalogSyncBroadcasterInjectable from "./broadcaster.injectable";

const catalogSyncToRendererInjectable = getInjectable({
  id: "catalog-sync-to-renderer",

  instantiate: (di) => {
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
    const ipcMain = di.inject(ipcMainInjectable);
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
