/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { setupIpcMainHandlers } from "./setup-ipc-main-handlers";
import loggerInjectable from "../../../../common/logger.injectable";
import clusterStoreInjectable from "../../../../common/cluster-store/cluster-store.injectable";
import { onLoadOfApplicationInjectionToken } from "@k8slens/application";
import applicationMenuItemCompositeInjectable from "../../../../features/application-menu/main/application-menu-item-composite.injectable";
import getClusterByIdInjectable from "../../../../common/cluster-store/get-by-id.injectable";
import pushCatalogToRendererInjectable from "../../../catalog-sync-to-renderer/push-catalog-to-renderer.injectable";
import clusterFramesInjectable from "../../../../common/cluster-frames.injectable";

const setupIpcMainHandlersInjectable = getInjectable({
  id: "setup-ipc-main-handlers",

  instantiate: (di) => ({
    run: () => {
      const logger = di.inject(loggerInjectable);

      logger.debug("[APP-MAIN] initializing ipc main handlers");

      setupIpcMainHandlers({
        applicationMenuItemComposite: di.inject(applicationMenuItemCompositeInjectable),
        pushCatalogToRenderer: di.inject(pushCatalogToRendererInjectable),
        clusterStore: di.inject(clusterStoreInjectable),
        getClusterById: di.inject(getClusterByIdInjectable),
        clusterFrames: di.inject(clusterFramesInjectable),
      });
    },
  }),

  injectionToken: onLoadOfApplicationInjectionToken,
  causesSideEffects: true,
});

export default setupIpcMainHandlersInjectable;
