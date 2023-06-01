/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Cluster } from "../../../../common/cluster/cluster";
import type { CatalogEntityRegistry } from "../../../api/catalog/entity/registry";
import type { ShowNotification } from "@k8slens/notifications";
import { when } from "mobx";
import { requestSetClusterFrameId } from "../../../ipc";
import type { EmitAppEvent } from "../../../../common/app-event-bus/emit-event.injectable";
import type { Logger } from "@k8slens/logger";

interface Dependencies {
  hostedCluster: Cluster;
  loadExtensions: () => void;
  catalogEntityRegistry: CatalogEntityRegistry;
  frameRoutingId: number;
  emitAppEvent: EmitAppEvent;
  logger: Logger;
  showErrorNotification: ShowNotification;
}

const logPrefix = "[CLUSTER-FRAME]:";

export const initClusterFrame =
  ({
    hostedCluster,
    loadExtensions,
    catalogEntityRegistry,
    frameRoutingId,
    emitAppEvent,
    logger,
    showErrorNotification,
  }: Dependencies) =>
    async () => {
    // TODO: Make catalogEntityRegistry already initialized when passed as dependency
      catalogEntityRegistry.init();

      logger.info(
        `${logPrefix} Init dashboard, clusterId=${hostedCluster.id}, frameId=${frameRoutingId}`,
      );

      await requestSetClusterFrameId(hostedCluster.id);
      await when(() => hostedCluster.ready.get()); // cluster.activate() is done at this point

      catalogEntityRegistry.activeEntity = hostedCluster.id;

      // Only load the extensions once the catalog has been populated.
      // Note that the Catalog might still have unprocessed entities until the extensions are fully loaded.
      when(
        () => catalogEntityRegistry.items.get().length > 0,
        () => loadExtensions(),
        {
          timeout: 15_000,
          onError: (error) => {
            logger.warn("[CLUSTER-FRAME]: error from activeEntity when()", error);

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
    };
