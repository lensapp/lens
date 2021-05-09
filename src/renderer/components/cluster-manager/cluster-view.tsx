import "./cluster-view.scss";
import React from "react";
import { comparer, computed, makeObservable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { ClusterStatus } from "./cluster-status";
import { hasLoadedView, initView, refreshViews } from "./lens-views";
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
    this.bindEvents();
  }

  get clusterId() {
    return getMatchedClusterId();
  }

  @computed get cluster(): Cluster {
    return ClusterStore.getInstance().getById(this.clusterId);
  }

  private bindEvents() {
    disposeOnUnmount(this, [
      reaction(() => [
        // refresh views when on of the following changes:
        hasLoadedView(this.clusterId),
        this.cluster?.available,
        this.cluster?.ready,
      ], changes => {
        console.log('CHANGES', changes)
        this.refreshViews(this.clusterId);
      }, {
        fireImmediately: true,
        equals: comparer.shallow,
      }),
    ]);
  }

  /**
   * Refresh cluster-views visibility and catalog's active entity.
   * @param visibleClusterId Currently viewing cluster's iframe
   */
  refreshViews = async (visibleClusterId: string) => {
    await initView(visibleClusterId);
    await requestMain(clusterActivateHandler, visibleClusterId, false);
    refreshViews(visibleClusterId);

    const activeEntity = catalogEntityRegistry.getById(visibleClusterId);
    catalogEntityRegistry.activeEntity = activeEntity;
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
