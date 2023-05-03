/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./cluster-view.scss";
import React from "react";
import { computed, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { ClusterStatus } from "./cluster-status";
import type { ClusterFrameHandler } from "./cluster-frame-handler";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { NavigateToCatalog } from "../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import navigateToCatalogInjectable from "../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import clusterFrameHandlerInjectable from "./cluster-frame-handler.injectable";
import type { CatalogEntityRegistry } from "../../api/catalog/entity/registry";
import catalogEntityRegistryInjectable from "../../api/catalog/entity/registry.injectable";
import type { RequestClusterActivation } from "../../../features/cluster/activation/common/request-token";
import requestClusterActivationInjectable from "../../../features/cluster/activation/renderer/request-activation.injectable";
import type { GetClusterById } from "../../../features/cluster/storage/common/get-by-id.injectable";
import getClusterByIdInjectable from "../../../features/cluster/storage/common/get-by-id.injectable";
import type { ParametersFromRouteInjectable } from "../../../common/front-end-routing/front-end-route-injection-token";
import type clusterViewRouteInjectable from "../../../common/front-end-routing/routes/cluster-view/cluster-view-route.injectable";

export interface ClusterViewProps {
  params: ParametersFromRouteInjectable<typeof clusterViewRouteInjectable>;
}

interface Dependencies {
  clusterFrames: ClusterFrameHandler;
  navigateToCatalog: NavigateToCatalog;
  entityRegistry: CatalogEntityRegistry;
  getClusterById: GetClusterById;
  requestClusterActivation: RequestClusterActivation;
}

@observer
class NonInjectedClusterView extends React.Component<Dependencies & ClusterViewProps> {
  get clusterId() {
    return this.props.params.clusterId;
  }

  readonly cluster = computed(() => this.props.getClusterById(this.clusterId));

  private readonly isViewLoaded = computed(() => this.props.clusterFrames.hasLoadedView(this.clusterId), {
    keepAlive: true,
    requiresReaction: true,
  });

  readonly isReady = computed(() => {
    const cluster = this.cluster.get();

    if (!cluster) {
      return false;
    }

    return cluster.ready.get() && cluster.available.get() && this.isViewLoaded.get();
  });

  componentDidMount() {
    this.bindEvents();
  }

  componentWillUnmount() {
    this.props.clusterFrames.clearVisibleCluster();
    this.props.entityRegistry.activeEntity = undefined;
  }

  bindEvents() {
    disposeOnUnmount(this, [
      reaction(() => this.clusterId, (clusterId) => {
        // TODO: replace with better handling
        if (!this.clusterId) {
          return;
        }

        if (!this.props.entityRegistry.getById(clusterId)) {
          return this.props.navigateToCatalog(); // redirect to catalog when the clusterId does not correspond to an entity
        }

        this.props.clusterFrames.setVisibleCluster(clusterId);
        this.props.clusterFrames.initView(clusterId);
        void this.props.requestClusterActivation({ clusterId });
        this.props.entityRegistry.activeEntity = clusterId;
      }, {
        fireImmediately: true,
      }),
    ]);
  }

  renderStatus() {
    const cluster = this.cluster.get();
    const isReady = this.isReady.get();

    if (cluster && !isReady) {
      return <ClusterStatus cluster={cluster} className="box center"/>;
    }

    return null;
  }

  render() {
    return (
      <div className="ClusterView flex column align-center">
        {this.renderStatus()}
      </div>
    );
  }
}

export const ClusterView = withInjectables<Dependencies, ClusterViewProps>(NonInjectedClusterView, {
  getProps: (di, props) => ({
    ...props,
    navigateToCatalog: di.inject(navigateToCatalogInjectable),
    clusterFrames: di.inject(clusterFrameHandlerInjectable),
    entityRegistry: di.inject(catalogEntityRegistryInjectable),
    getClusterById: di.inject(getClusterByIdInjectable),
    requestClusterActivation: di.inject(requestClusterActivationInjectable),
  }),
});

