/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import catalogEntityRegistryInjectable from "../../api/catalog/entity/registry.injectable";
import frameRoutingIdInjectable from "../../../features/electron/renderer/frame-routing-id.injectable";
import hostedClusterInjectable from "../../cluster-frame-context/hosted-cluster.injectable";
import assert from "assert";
import emitAppEventInjectable from "../../../common/app-event-bus/emit-event.injectable";
import showErrorNotificationInjectable from "../../components/notifications/show-error-notification.injectable";
import autoInitExtensionsInjectable from "../../../features/extensions/loader/common/auto-init-extensions.injectable";
import prefixedLoggerInjectable from "../../../common/logger/prefixed-logger.injectable";
import { when } from "mobx";
import requestSetClusterFrameIdInjectable from "../../../features/cluster/frame-id/renderer/request-set-frame-id.injectable";

const initClusterFrameInjectable = getInjectable({
  id: "init-cluster-frame",

  instantiate: (di) => {
    const hostedCluster = di.inject(hostedClusterInjectable);

    assert(hostedCluster, "This can only be injected within a cluster frame");

    const loadExtensions = di.inject(autoInitExtensionsInjectable);
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
    const frameRoutingId = di.inject(frameRoutingIdInjectable);
    const emitAppEvent = di.inject(emitAppEventInjectable);
    const logger = di.inject(prefixedLoggerInjectable, "CLUSTER-FRAME");
    const showErrorNotification = di.inject(showErrorNotificationInjectable);
    const requestSetClusterFrameId = di.inject(requestSetClusterFrameIdInjectable);

    return async (unmountRoot: () => void) => {
      logger.info(`Init dashboard, clusterId=${hostedCluster.id}, frameId=${frameRoutingId}`);

      await requestSetClusterFrameId(hostedCluster.id);
      await hostedCluster.whenReady; // cluster.activate() is done at this point

      catalogEntityRegistry.activeEntity = hostedCluster.id;

      // Only load the extensions once the catalog has been populated.
      // Note that the Catalog might still have unprocessed entities until the extensions are fully loaded.
      when(
        () => catalogEntityRegistry.items.get().length > 0,
        () =>
          loadExtensions(),
        {
          timeout: 15_000,
          onError: (error) => {
            logger.warn(
              "[CLUSTER-FRAME]: error from activeEntity when()",
              error,
            );

            showErrorNotification("Failed to get KubernetesCluster for this view. Extensions will not be loaded.");
          },
        },
      );

      setTimeout(() => {
        emitAppEvent({
          name: "cluster",
          action: "open",
          params: {
            clusterId: hostedCluster.id,
          },
        });
      });

      window.addEventListener("beforeunload", () => {
        logger.info(`Unload dashboard, clusterId=${(hostedCluster.id)}, frameId=${frameRoutingId}`);
        unmountRoot();
      });
    };
  },
});

export default initClusterFrameInjectable;
