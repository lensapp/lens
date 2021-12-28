/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import type { Cluster } from "../../../../common/cluster/cluster";
import type { CatalogEntityRegistry } from "../../../api/catalog-entity-registry";
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
import type { ClusterFrameContext } from "../../../cluster-frame-context/cluster-frame-context";
import { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";

interface Dependencies {
  hostedCluster: Cluster;
  loadExtensions: (entity: CatalogEntity) => void;
  catalogEntityRegistry: CatalogEntityRegistry;
  frameRoutingId: number;
  emitEvent: (event: AppEvent) => void;

  // TODO: This dependency belongs to KubeObjectStore
  clusterFrameContext: ClusterFrameContext
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

      // Only load the extensions once the catalog has been populated
      when(
        () => Boolean(catalogEntityRegistry.activeEntity),
        () =>
          loadExtensions(catalogEntityRegistry.activeEntity as KubernetesCluster),
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
