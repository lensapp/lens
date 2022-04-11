/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForLensLocalStorageInjectable from "../../../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import { setupIpcMainHandlers } from "./setup-ipc-main-handlers";
import loggerInjectable from "../../../../../common/logger.injectable";
import clusterManagerInjectable from "../../../../cluster-manager.injectable";
import applicationMenuItemsInjectable from "../../../../menu/application-menu-items.injectable";
import getAbsolutePathInjectable from "../../../../../common/path/get-absolute-path.injectable";
import { afterApplicationIsReadyInjectionToken } from "../../after-application-is-ready-injection-token";

const setupIpcMainHandlersInjectable = getInjectable({
  id: "setup-ipc-main-handlers",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);

    const directoryForLensLocalStorage = di.inject(
      directoryForLensLocalStorageInjectable,
    );

    const clusterManager = di.inject(clusterManagerInjectable);
    const applicationMenuItems = di.inject(applicationMenuItemsInjectable);
    const getAbsolutePath = di.inject(getAbsolutePathInjectable);

    return {
      run: () => {
        logger.debug("[APP-MAIN] initializing ipc main handlers");

        setupIpcMainHandlers({
          applicationMenuItems,
          getAbsolutePath,
          directoryForLensLocalStorage,
          clusterManager,
        });
      },
    };
  },

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default setupIpcMainHandlersInjectable;
