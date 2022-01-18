/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./cluster-view.scss";
import React from "react";
import { computed, makeObservable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { ClusterStatus } from "./cluster-status";
import { ClusterFrameHandler } from "./lens-views";
import type { Cluster } from "../../../common/cluster/cluster";
import { ClusterStore } from "../../../common/cluster-store/cluster-store";
import { requestMain } from "../../../common/ipc";
import { clusterActivateHandler } from "../../../common/cluster-ipc";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { navigate } from "../../navigation";
import { catalogURL, ClusterViewRouteParams } from "../../../common/routes";

interface Props extends RouteComponentProps<ClusterViewRouteParams> {
}

@observer
export class ClusterView extends React.Component<Props> {
  private store = ClusterStore.getInstance();

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  @computed get clusterId() {
    return this.props.match.params.clusterId;
  }

  @computed get cluster(): Cluster | undefined {
    return this.store.getById(this.clusterId);
  }

  @computed get isReady(): boolean {
    const { cluster, clusterId } = this;

    return cluster?.ready && cluster?.available && ClusterFrameHandler.getInstance().hasLoadedView(clusterId);
  }

  componentDidMount() {
    this.bindEvents();
  }

  componentWillUnmount() {
    ClusterFrameHandler.getInstance().clearVisibleCluster();
    catalogEntityRegistry.activeEntity = null;
  }

  bindEvents() {
    disposeOnUnmount(this, [
      reaction(() => this.clusterId, async (clusterId) => {
        ClusterFrameHandler.getInstance().setVisibleCluster(clusterId);
        ClusterFrameHandler.getInstance().initView(clusterId);
        requestMain(clusterActivateHandler, clusterId, false); // activate and fetch cluster's state from main
        catalogEntityRegistry.activeEntity = clusterId;
      }, {
        fireImmediately: true,
      }),

      reaction(() => [this.cluster?.ready, this.cluster?.disconnected], ([, disconnected]) => {
        if (ClusterFrameHandler.getInstance().hasLoadedView(this.clusterId) && disconnected) {
          navigate(catalogURL()); // redirect to catalog when active cluster get disconnected/not available
        }
      }),
    ]);
  }

  renderStatus(): React.ReactNode {
    const { cluster, isReady } = this;

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
