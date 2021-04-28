import "./cluster-view.scss";
import React from "react";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { IClusterViewRouteParams } from "./cluster-view.route";
import { ClusterStatus } from "./cluster-status";
import { hasLoadedView, initView, refreshViews } from "./lens-views";
import { Cluster } from "../../../main/cluster";
import { ClusterStore } from "../../../common/cluster-store";
import { requestMain } from "../../../common/ipc";
import { clusterActivateHandler } from "../../../common/cluster-ipc";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";

interface Props extends RouteComponentProps<IClusterViewRouteParams> {
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
      }, {
        fireImmediately: true,
      })
    ]);
  }

  componentWillUnmount() {
    this.hideCluster();
  }

  showCluster(clusterId: string) {
    initView(clusterId);
    requestMain(clusterActivateHandler, this.clusterId, false);

    const entity = catalogEntityRegistry.getById(this.clusterId);

    if (entity) {
      catalogEntityRegistry.activeEntity = entity;
    }
  }

  hideCluster() {
    refreshViews();

    if (catalogEntityRegistry.activeEntity?.metadata?.uid === this.clusterId) {
      catalogEntityRegistry.activeEntity = null;
    }
  }

  render() {
    const { cluster } = this;
    const showStatus = cluster && (!cluster.available || !hasLoadedView(cluster.id) || !cluster.ready);

    return (
      <div className="ClusterView flex align-center">
        {showStatus && (
          <ClusterStatus key={cluster.id} clusterId={cluster.id} className="box center"/>
        )}
      </div>
    );
  }
}
