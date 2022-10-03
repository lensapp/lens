/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { setupIpcMainHandlers } from "./setup-ipc-main-handlers";
import loggerInjectable from "../../../../common/logger.injectable";
import clusterManagerInjectable from "../../../cluster/manager.injectable";
import applicationMenuItemsInjectable from "../../../menu/application-menu-items.injectable";
import clusterStoreInjectable from "../../../../common/cluster-store/cluster-store.injectable";
import { onLoadOfApplicationInjectionToken } from "../../../start-main-application/runnable-tokens/on-load-of-application-injection-token";
import operatingSystemThemeInjectable from "../../../theme/operating-system-theme.injectable";
import catalogEntityRegistryInjectable from "../../../catalog/entity-registry.injectable";
import askUserForFilePathsInjectable from "../../../ipc/ask-user-for-file-paths.injectable";

const setupIpcMainHandlersInjectable = getInjectable({
  id: "setup-ipc-main-handlers",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const clusterManager = di.inject(clusterManagerInjectable);
    const applicationMenuItems = di.inject(applicationMenuItemsInjectable);
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
    const clusterStore = di.inject(clusterStoreInjectable);
    const operatingSystemTheme = di.inject(operatingSystemThemeInjectable);
    const askUserForFilePaths = di.inject(askUserForFilePathsInjectable);

    return {
      id: "setup-ipc-main-handlers",
      run: () => {
        logger.debug("[APP-MAIN] initializing ipc main handlers");

        setupIpcMainHandlers({
          applicationMenuItems,
          clusterManager,
          catalogEntityRegistry,
          clusterStore,
          operatingSystemTheme,
          askUserForFilePaths,
        });
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
  causesSideEffects: true,
});

export default setupIpcMainHandlersInjectable;
