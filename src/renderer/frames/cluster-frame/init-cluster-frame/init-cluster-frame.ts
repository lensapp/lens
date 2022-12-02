/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Cluster } from "../../../../common/cluster/cluster";
import type { CatalogEntityRegistry } from "../../../api/catalog/entity/registry";
import logger from "../../../../main/logger";
import { Notifications } from "../../../components/notifications";
import { when } from "mobx";
import type { ClusterFrameContext } from "../../../cluster-frame-context/cluster-frame-context";
import { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";
import { requestSetClusterFrameId } from "../../../ipc";
import type { EmitAppEvent } from "../../../../common/app-event-bus/emit-event.injectable";

interface Dependencies {
  hostedCluster: Cluster;
  loadExtensions: () => void;
  catalogEntityRegistry: CatalogEntityRegistry;
  frameRoutingId: number;
  emitAppEvent: EmitAppEvent;

  // TODO: This dependency belongs to KubeObjectStore
  clusterFrameContext: ClusterFrameContext;
}

const logPrefix = "[CLUSTER-FRAME]:";

export const initClusterFrame = ({
  hostedCluster,
  loadExtensions,
  catalogEntityRegistry,
  frameRoutingId,
  emitAppEvent,
  clusterFrameContext,
}: Dependencies) =>
  async (unmountRoot: () => void) => {
    // TODO: Make catalogEntityRegistry already initialized when passed as dependency
    catalogEntityRegistry.init();

    logger.info(
      `${logPrefix} Init dashboard, clusterId=${hostedCluster.id}, frameId=${frameRoutingId}`,
    );

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
          console.warn(
            "[CLUSTER-FRAME]: error from activeEntity when()",
            error,
          );

          Notifications.error(
            "Failed to get KubernetesCluster for this view. Extensions will not be loaded.",
          );
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

    window.onbeforeunload = () => {
      logger.info(
        `${logPrefix} Unload dashboard, clusterId=${(hostedCluster.id)}, frameId=${frameRoutingId}`,
      );

      unmountRoot();
    };
    // TODO: Make context dependency of KubeObjectStore
    KubeObjectStore.defaultContext.set(clusterFrameContext);
  };
