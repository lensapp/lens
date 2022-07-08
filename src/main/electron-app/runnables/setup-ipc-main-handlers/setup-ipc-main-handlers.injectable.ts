/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForLensLocalStorageInjectable from "../../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import type { SetupIpcMainHandlersDependencies } from "./setup-ipc-main-handlers";
import { setupIpcMainHandlers } from "./setup-ipc-main-handlers";
import loggerInjectable from "../../../../common/logger.injectable";
import clusterManagerInjectable from "../../../cluster-manager.injectable";
import applicationMenuItemsInjectable from "../../../menu/application-menu-items.injectable";
import getAbsolutePathInjectable from "../../../../common/path/get-absolute-path.injectable";
import clusterStoreInjectable from "../../../../common/cluster-store/cluster-store.injectable";
import { onLoadOfApplicationInjectionToken } from "../../../start-main-application/runnable-tokens/on-load-of-application-injection-token";
import operatingSystemThemeInjectable from "../../../theme/operating-system-theme.injectable";
import catalogEntityRegistryInjectable from "../../../catalog/entity-registry.injectable";
import askUserForFilePathsInjectable from "../../../ipc/ask-user-for-file-paths.injectable";
import emitEventInjectable from "../../../../common/app-event-bus/emit-event.injectable";

const setupIpcMainHandlersInjectable = getInjectable({
  id: "setup-ipc-main-handlers",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const deps: SetupIpcMainHandlersDependencies = {
      directoryForLensLocalStorage: di.inject(directoryForLensLocalStorageInjectable),
      clusterManager: di.inject(clusterManagerInjectable),
      applicationMenuItems: di.inject(applicationMenuItemsInjectable),
      getAbsolutePath: di.inject(getAbsolutePathInjectable),
      catalogEntityRegistry: di.inject(catalogEntityRegistryInjectable),
      clusterStore: di.inject(clusterStoreInjectable),
      operatingSystemTheme: di.inject(operatingSystemThemeInjectable),
      askUserForFilePaths: di.inject(askUserForFilePathsInjectable),
      emitEvent: di.inject(emitEventInjectable),
    };

    return {
      run: () => {
        logger.debug("[APP-MAIN] initializing ipc main handlers");
        setupIpcMainHandlers(deps);
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
  causesSideEffects: true,
});

export default setupIpcMainHandlersInjectable;
