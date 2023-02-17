/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { when } from "mobx";
import prefixedLoggerInjectable from "../../../common/logger/prefixed-logger.injectable";
import autoInitExtensionsInjectable from "../../../features/extensions/loader/common/auto-init-extensions.injectable";
import catalogEntityRegistryInjectable from "../../api/catalog/entity/registry.injectable";
import { beforeClusterFrameStartsSecondInjectionToken } from "../../before-frame-starts/tokens";
import clusterFrameClusterInjectable from "../../cluster-frame-context/cluster-frame-cluster.injectable";
import showErrorNotificationInjectable from "../../components/notifications/show-error-notification.injectable";
import waitForClusterToFinishActivatingInjectable from "./wait-for-cluster-to-finish-activating.injectable";

const loadExtensionsAfterCatalogPopulatesInjectable = getInjectable({
  id: "load-extensions-after-catalog-populates",
  instantiate: (di) => ({
    id: "load-extensions-after-catalog-populates",
    run: async () => {
      const cluster = di.inject(clusterFrameClusterInjectable);
      const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
      const autoInitExtensions = di.inject(autoInitExtensionsInjectable);
      const logger = di.inject(prefixedLoggerInjectable, "CLUSTER-FRAME");
      const showErrorNotification = di.inject(showErrorNotificationInjectable);

      catalogEntityRegistry.activeEntity = cluster.id;

      // Only load the extensions once the catalog has been populated.
      // Note that the Catalog might still have unprocessed entities until the extensions are fully loaded.
      when(
        () => catalogEntityRegistry.items.get().length > 0,
        () =>
          autoInitExtensions(),
        {
          timeout: 15_000,
          onError: (error) => {
            logger.warn("error from activeEntity when()", error);
            showErrorNotification("Failed to get KubernetesCluster for this view. Extensions will not be loaded.");
          },
        },
      );
    },
    runAfter: di.inject(waitForClusterToFinishActivatingInjectable),
  }),
  injectionToken: beforeClusterFrameStartsSecondInjectionToken,
});

export default loadExtensionsAfterCatalogPopulatesInjectable;
