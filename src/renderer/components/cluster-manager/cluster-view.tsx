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
import { ClusterStatus } from "./cluster-status";
import { initView, lensViews, refreshViews } from "./lens-views";
import { Cluster } from "../../../main/cluster";
import { ClusterStore } from "../../../common/cluster-store";
import { requestMain } from "../../../common/ipc";
import { clusterActivateHandler } from "../../../common/cluster-ipc";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { getMatchedClusterId } from "../../navigation";

@observer
export class ClusterView extends React.Component {
  constructor(props: {}) {
    super(props);
    makeObservable(this);
  }

  get clusterId() {
    return getMatchedClusterId();
  }

  @computed get cluster(): Cluster {
    return ClusterStore.getInstance().getById(this.clusterId);
  }

  @computed get isReady(): boolean {
    const { cluster, clusterId } = this;

    return [
      cluster?.available,
      cluster?.ready,
      lensViews.get(clusterId)?.isLoaded, // cluster's iframe is loaded & ready
    ].every(Boolean);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.isReady, () => this.refreshViews(), {
        fireImmediately: true
      }),
    ]);
  }

  /**
   * Refresh cluster-views (iframes) visibility and catalog's active entity.
   */
  refreshViews(clusterId = this.clusterId) {
    try {
      initView(clusterId);
      requestMain(clusterActivateHandler, clusterId, false);
      refreshViews(clusterId);
      catalogEntityRegistry.activeEntity = catalogEntityRegistry.getById(clusterId);
    } catch (error) {
      console.error(`refreshing cluster-view: ${error}`);
    }
  }

  render() {
    const { clusterId, isReady } = this;

    return (
      <div className="ClusterView flex align-center">
        {!isReady && (
          <ClusterStatus key={clusterId} clusterId={clusterId} className="box center"/>
        )}
      </div>
    );
  }
}
