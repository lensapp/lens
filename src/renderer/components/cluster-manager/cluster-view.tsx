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

import "./cluster-view.scss";
import React from "react";
import { computed, makeObservable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { ClusterStatus } from "./cluster-status";
import { hasLoadedView, initView, refreshViews } from "./lens-views";
import type { Cluster } from "../../../main/cluster";
import { ClusterStore } from "../../../common/cluster-store";
import { requestMain } from "../../../common/ipc";
import { clusterActivateHandler } from "../../../common/cluster-ipc";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { navigate } from "../../navigation";
import { catalogURL, ClusterViewRouteParams } from "../../../common/routes";
import { previousActiveTab } from "../+catalog";
import { ClusterTopbar } from "./cluster-topbar";

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

    return cluster?.ready && cluster?.available && hasLoadedView(clusterId);
  }

  componentDidMount() {
    this.bindEvents();
  }

  componentWillUnmount() {
    refreshViews();
    catalogEntityRegistry.activeEntity = null;
  }

  bindEvents() {
    disposeOnUnmount(this, [
      reaction(() => this.clusterId, async (clusterId) => {
        refreshViews(clusterId); // refresh visibility of active cluster
        initView(clusterId); // init cluster-view (iframe), requires parent container #lens-views to be in DOM
        requestMain(clusterActivateHandler, clusterId, false); // activate and fetch cluster's state from main
        catalogEntityRegistry.activeEntity = catalogEntityRegistry.getById(clusterId);
      }, {
        fireImmediately: true,
      }),

      reaction(() => [this.cluster?.ready, this.cluster?.disconnected], (values) => {
        const disconnected = values[1];

        if (hasLoadedView(this.clusterId) && disconnected) {
          navigate(`${catalogURL()}/${previousActiveTab.get()}`); // redirect to catalog when active cluster get disconnected/not available
        }
      }),
    ]);
  }

  renderStatus(): React.ReactNode {
    const { clusterId, cluster, isReady } = this;

    if (cluster && !isReady) {
      return <ClusterStatus key={clusterId} clusterId={clusterId} className="box center"/>;
    }

    return null;
  }

  render() {
    return (
      <div className="ClusterView flex column align-center">
        <ClusterTopbar {...this.props}/>
        {this.renderStatus()}
      </div>
    );
  }
}
