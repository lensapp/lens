/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Cluster } from "../../../../common/cluster/cluster";
import type { CatalogEntityRegistry } from "../../../catalog/entity-registry";
import logger from "../../../../main/logger";
import { Terminal } from "../../../components/dock/terminal/terminal";
import { requestMain } from "../../../../common/ipc";
import { clusterSetFrameIdHandler } from "../../../../common/cluster-ipc";
import type { KubernetesCluster } from "../../../../common/catalog-entities";
import { Notifications } from "../../../components/notifications";
import type { AppEvent } from "../../../../common/app-event-bus/event-bus";
import type { CatalogEntity } from "../../../../common/catalog";
import { when } from "mobx";
import { unmountComponentAtNode } from "react-dom";
import type { FrameContext } from "../../../cluster-frame-context/cluster-frame-context";
import { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";

interface Dependencies {
  hostedCluster: Cluster;
  loadExtensions: (getCluster: () => CatalogEntity) => void;
  catalogEntityRegistry: CatalogEntityRegistry;
  frameRoutingId: number;
  emitEvent: (event: AppEvent) => void;

  // TODO: This dependency belongs to KubeObjectStore
  clusterFrameContext: FrameContext
}

const logPrefix = "[CLUSTER-FRAME]:";

export const initClusterFrame =
  ({ hostedCluster, loadExtensions, catalogEntityRegistry, frameRoutingId, emitEvent, clusterFrameContext }: Dependencies) =>
    async (rootElem: HTMLElement) => {

      // TODO: Make catalogEntityRegistry already initialized when passed as dependency
      catalogEntityRegistry.init();

      logger.info(
        `${logPrefix} Init dashboard, clusterId=${hostedCluster.id}, frameId=${frameRoutingId}`,
      );

      await Terminal.preloadFonts();
      await requestMain(clusterSetFrameIdHandler, hostedCluster.id);
      await hostedCluster.whenReady; // cluster.activate() is done at this point

      catalogEntityRegistry.activeEntity = hostedCluster.id;

      // Only load the extensions once the catalog has been populated.
      // Note that the Catalog might still have unprocessed entities until the extensions are fully loaded.
      when(
        () => catalogEntityRegistry.items.length > 0,
        () =>
          loadExtensions(() => catalogEntityRegistry.activeEntity as KubernetesCluster),
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
        emitEvent({
          name: "cluster",
          action: "open",
          params: {
            clusterId: hostedCluster.id,
          },
        });
      });

      window.addEventListener("online", () => {
        window.location.reload();
      });

      window.onbeforeunload = () => {
        logger.info(
          `${logPrefix} Unload dashboard, clusterId=${(hostedCluster.id)}, frameId=${frameRoutingId}`,
        );

        unmountComponentAtNode(rootElem);
      };

      // TODO: Make context dependency of KubeObjectStore
      KubeObjectStore.defaultContext.set(clusterFrameContext);
    };
