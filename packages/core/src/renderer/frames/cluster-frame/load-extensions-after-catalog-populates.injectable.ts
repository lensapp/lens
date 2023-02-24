/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { when } from "mobx";
import prefixedLoggerInjectable from "../../../common/logger/prefixed-logger.injectable";
import autoInitExtensionsInjectable from "../../../features/extensions/loader/common/auto-init-extensions.injectable";
import sendBundledExtensionsLoadedInjectable from "../../../features/extensions/loader/renderer/send-bundled-extensions-loaded.injectable";
import catalogEntityRegistryInjectable from "../../api/catalog/entity/registry.injectable";
import { beforeClusterFrameStartsSecondInjectionToken } from "../../before-frame-starts/tokens";
import clusterFrameClusterInjectable from "../../cluster-frame-context/cluster-frame-cluster.injectable";
import showErrorNotificationInjectable from "../../components/notifications/show-error-notification.injectable";
import { delay, disposer } from "../../utils";
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
      const sendBundledExtensionsLoaded = di.inject(sendBundledExtensionsLoadedInjectable);

      catalogEntityRegistry.activeEntity = cluster.id;

      void (async () => {
        const waitForCatalogEntityToAppear = when(() => catalogEntityRegistry.items.get().length > 0);
        const maxWaitingTime = delay(15_000);
        const cleanup = disposer(
          () => waitForCatalogEntityToAppear.cancel(),
          () => maxWaitingTime.cancel(),
        );

        const entityAppeared = await Promise.race([
          waitForCatalogEntityToAppear.then(() => true),
          maxWaitingTime.then(() => false),
        ]);

        cleanup();

        if (!entityAppeared) {
          // Only load the extensions once the catalog has been populated.
          // Note that the Catalog might still have unprocessed entities until the extensions are fully loaded.
          logger.warn("Failed to get KubernetesCluster before timeout");
          showErrorNotification("Failed to get KubernetesCluster for this view. Extensions will not be loaded.");
        } else {
          await autoInitExtensions();
        }

        sendBundledExtensionsLoaded();
      })();
    },
    runAfter: di.inject(waitForClusterToFinishActivatingInjectable),
  }),
  injectionToken: beforeClusterFrameStartsSecondInjectionToken,
});

export default loadExtensionsAfterCatalogPopulatesInjectable;
