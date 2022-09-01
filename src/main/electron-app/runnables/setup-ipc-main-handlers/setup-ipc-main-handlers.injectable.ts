/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForLensLocalStorageInjectable from "../../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import { setupIpcMainHandlers } from "./setup-ipc-main-handlers";
import loggerInjectable from "../../../../common/logger.injectable";
import clusterManagerInjectable from "../../../cluster/manager.injectable";
import applicationMenuItemsInjectable from "../../../menu/application-menu-items.injectable";
import getAbsolutePathInjectable from "../../../../common/path/get-absolute-path.injectable";
import clusterStoreInjectable from "../../../../common/cluster-store/cluster-store.injectable";
import { onLoadOfApplicationInjectionToken } from "../../../start-main-application/runnable-tokens/on-load-of-application-injection-token";
import operatingSystemThemeInjectable from "../../../theme/operating-system-theme.injectable";
import catalogEntityRegistryInjectable from "../../../catalog/entity-registry.injectable";
import askUserForFilePathsInjectable from "../../../ipc/ask-user-for-file-paths.injectable";
import clustersThatAreBeingDeletedInjectable from "../../../cluster/are-being-deleted.injectable";

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
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
    const clusterStore = di.inject(clusterStoreInjectable);
    const operatingSystemTheme = di.inject(operatingSystemThemeInjectable);
    const askUserForFilePaths = di.inject(askUserForFilePathsInjectable);
    const clustersThatAreBeingDeleted = di.inject(clustersThatAreBeingDeletedInjectable);

    return {
      id: "setup-ipc-main-handlers",
      run: () => {
        logger.debug("[APP-MAIN] initializing ipc main handlers");

        setupIpcMainHandlers({
          applicationMenuItems,
          getAbsolutePath,
          directoryForLensLocalStorage,
          clusterManager,
          catalogEntityRegistry,
          clusterStore,
          operatingSystemTheme,
          askUserForFilePaths,
          clustersThatAreBeingDeleted,
        });
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
  causesSideEffects: true,
});

export default setupIpcMainHandlersInjectable;
