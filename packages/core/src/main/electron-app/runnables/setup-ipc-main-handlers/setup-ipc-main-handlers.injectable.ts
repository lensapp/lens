/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { setupIpcMainHandlers } from "./setup-ipc-main-handlers";
import { loggerInjectionToken } from "@k8slens/logger";
import { onLoadOfApplicationInjectionToken } from "@k8slens/application";
import applicationMenuItemCompositeInjectable from "../../../../features/application-menu/main/application-menu-item-composite.injectable";
import pushCatalogToRendererInjectable from "../../../catalog-sync-to-renderer/push-catalog-to-renderer.injectable";
import clusterFramesInjectable from "../../../../common/cluster-frames.injectable";
import getClusterByIdInjectable from "../../../../features/cluster/storage/common/get-by-id.injectable";
import clustersInjectable from "../../../../features/cluster/storage/common/clusters.injectable";

const setupIpcMainHandlersInjectable = getInjectable({
  id: "setup-ipc-main-handlers",

  instantiate: (di) => ({
    run: () => {
      const logger = di.inject(loggerInjectionToken);

      logger.debug("[APP-MAIN] initializing ipc main handlers");

      setupIpcMainHandlers({
        applicationMenuItemComposite: di.inject(applicationMenuItemCompositeInjectable),
        pushCatalogToRenderer: di.inject(pushCatalogToRendererInjectable),
        clusters: di.inject(clustersInjectable),
        getClusterById: di.inject(getClusterByIdInjectable),
        clusterFrames: di.inject(clusterFramesInjectable),
      });
    },
  }),

  injectionToken: onLoadOfApplicationInjectionToken,
  causesSideEffects: true,
});

export default setupIpcMainHandlersInjectable;
