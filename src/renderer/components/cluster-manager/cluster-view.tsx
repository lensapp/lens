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
