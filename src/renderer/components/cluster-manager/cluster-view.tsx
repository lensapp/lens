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
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { ClusterStatus } from "./cluster-status";
import { hasLoadedView, initView, lensViews, refreshViews } from "./lens-views";
import type { Cluster } from "../../../main/cluster";
import { ClusterStore } from "../../../common/cluster-store";
import { requestMain } from "../../../common/ipc";
import { navigate } from "../../navigation";
import { catalogURL, ClusterViewRouteParams } from "../../../common/routes";
import { activate } from "../../../common/cluster-ipc";
import { CatalogEntityRegistry } from "../../api/catalog-entity-registry";

interface Props extends RouteComponentProps<ClusterViewRouteParams> {
}

@observer
export class ClusterView extends React.Component<Props> {
  get clusterId() {
    return this.props.match.params.clusterId;
  }

  get cluster(): Cluster {
    return ClusterStore.getInstance().getById(this.clusterId);
  }

  async componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.clusterId, (clusterId) => {
        this.showCluster(clusterId);
      }, { fireImmediately: true}
      ),
      reaction(() => this.cluster?.ready, (ready) => {
        const clusterView = lensViews.get(this.clusterId);

        if (clusterView && clusterView.isLoaded && !ready) {
          navigate(catalogURL());
        }
      })
    ]);
  }

  componentWillUnmount() {
    this.hideCluster();
  }

  showCluster(clusterId: string) {
    initView(clusterId);
    requestMain(activate, this.clusterId, false);

    const entity = CatalogEntityRegistry.getInstance().getById(this.clusterId);

    if (entity) {
      CatalogEntityRegistry.getInstance().activeEntity = entity;
    }
  }

  hideCluster() {
    refreshViews();

    if (CatalogEntityRegistry.getInstance().activeEntity?.metadata?.uid === this.clusterId) {
      CatalogEntityRegistry.getInstance().activeEntity = null;
    }
  }

  render() {
    const { cluster } = this;
    const showStatus = cluster && (!cluster.available || !hasLoadedView(cluster.id) || !cluster.ready);

    refreshViews(cluster.id);

    return (
      <div className="ClusterView flex align-center">
        {showStatus && (
          <ClusterStatus key={cluster.id} clusterId={cluster.id} className="box center"/>
        )}
      </div>
    );
  }
}
