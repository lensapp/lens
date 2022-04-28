/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForLensLocalStorageInjectable from "../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import { initIpcMainHandlers } from "./init-ipc-main-handlers";
import getAbsolutePathInjectable from "../../../common/path/get-absolute-path.injectable";
import applicationMenuItemsInjectable from "../../menu/application-menu-items.injectable";
import appEventBusInjectable from "../../../common/app-event-bus/app-event-bus.injectable";
import clusterManagerInjectable from "../../cluster/manager.injectable";
import clusterStoreInjectable from "../../../common/cluster/store.injectable";
import getClusterByIdInjectable from "../../../common/cluster/get-by-id.injectable";

const initIpcMainHandlersInjectable = getInjectable({
  id: "init-ipc-main-handlers",

  instantiate: (di) => initIpcMainHandlers({
    applicationMenuItems: di.inject(applicationMenuItemsInjectable),
    directoryForLensLocalStorage: di.inject(directoryForLensLocalStorageInjectable),
    getAbsolutePath: di.inject(getAbsolutePathInjectable),
    appEventBus: di.inject(appEventBusInjectable),
    clusterManager: di.inject(clusterManagerInjectable),
    clusterStore: di.inject(clusterStoreInjectable),
    getClusterById: di.inject(getClusterByIdInjectable),
  }),
});

export default initIpcMainHandlersInjectable;
