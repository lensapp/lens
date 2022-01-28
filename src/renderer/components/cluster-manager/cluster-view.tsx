/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./cluster-view.scss";
import React, { useEffect } from "react";
import { reaction } from "mobx";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { ClusterStatus } from "./cluster-status";
import type { Cluster } from "../../../common/cluster/cluster";
import type { ClusterFrameHandler } from "./cluster-frame-handler";
import { requestMain } from "../../../common/ipc";
import { clusterActivateHandler } from "../../../common/cluster-ipc";
import type { CatalogEntityRegistry } from "../../catalog/entity-registry";
import { navigate } from "../../navigation";
import { catalogURL, ClusterViewRouteParams } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import catalogEntityRegistryInjectable from "../../catalog/entity-registry.injectable";
import clusterFrameHandlerInjectable from "./cluster-frame-handler.injectable";
import { disposer } from "../../utils";
import getClusterByIdInjectable from "../../../common/cluster-store/get-cluster-by-id.injectable";

export interface ClusterViewProps extends RouteComponentProps<ClusterViewRouteParams> {
}

interface Dependencies {
  catalogEntityRegistry: CatalogEntityRegistry;
  getClusterById: (id: string) => Cluster;
  clusterFrameHandler: ClusterFrameHandler;
}

const NonInjectedClusterView = observer(({ catalogEntityRegistry, getClusterById, clusterFrameHandler, match }: Dependencies & ClusterViewProps) => {
  const { clusterId } = match.params;
  const cluster = getClusterById(clusterId);
  const isReady = Boolean(cluster?.ready && cluster?.available && clusterFrameHandler.hasLoadedView(clusterId));

  useEffect(() => disposer(
    reaction(() => clusterId, (clusterId) => {
      clusterFrameHandler.setVisibleCluster(clusterId);
      clusterFrameHandler.initView(clusterId);
      requestMain(clusterActivateHandler, clusterId, false); // activate and fetch cluster's state from main
      catalogEntityRegistry.activeEntity = clusterId;
    }, {
      fireImmediately: true,
    }),

    reaction(() => [cluster?.ready, cluster?.disconnected], ([, disconnected]) => {
      if (clusterFrameHandler.hasLoadedView(clusterId) && disconnected) {
        navigate(catalogURL()); // redirect to catalog when active cluster get disconnected/not available
      }
    }),
    () => {
      clusterFrameHandler.clearVisibleCluster();
      catalogEntityRegistry.activeEntity = null;
    },
  ), []);

  return (
    <div className="ClusterView flex column align-center">
      {(cluster && !isReady) && (
        <ClusterStatus
          cluster={cluster}
          className="box center"
        />
      )}
    </div>
  );
});

export const ClusterView = withInjectables<Dependencies, ClusterViewProps>(NonInjectedClusterView, {
  getProps: (di, props) => ({
    catalogEntityRegistry: di.inject(catalogEntityRegistryInjectable),
    getClusterById: di.inject(getClusterByIdInjectable),
    clusterFrameHandler: di.inject(clusterFrameHandlerInjectable),
    ...props,
  }),
});
