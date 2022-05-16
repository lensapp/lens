/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./replicaset-details.scss";
import React from "react";
import { makeObservable, observable, reaction } from "mobx";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import { PodDetailsStatuses } from "../+workloads-pods/pod-details-statuses";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import { disposeOnUnmount, observer } from "mobx-react";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import type { PodMetricData } from "../../../common/k8s-api/endpoints";
import { getMetricsForReplicaSets, ReplicaSet } from "../../../common/k8s-api/endpoints";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object-meta";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import type { PodStore } from "../+workloads-pods/store";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import type { ReplicaSetStore } from "./store";
import replicaSetStoreInjectable from "./store.injectable";
import type { GetActiveClusterEntity } from "../../api/catalog/entity/get-active-cluster-entity.injectable";
import getActiveClusterEntityInjectable from "../../api/catalog/entity/get-active-cluster-entity.injectable";

export interface ReplicaSetDetailsProps extends KubeObjectDetailsProps<ReplicaSet> {
}

interface Dependencies {
  subscribeStores: SubscribeStores;
  podStore: PodStore;
  replicaSetStore: ReplicaSetStore;
  getActiveClusterEntity: GetActiveClusterEntity;
}

@observer
class NonInjectedReplicaSetDetails extends React.Component<ReplicaSetDetailsProps & Dependencies> {
  @observable metrics: PodMetricData | null = null;

  constructor(props: ReplicaSetDetailsProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.object, () => {
        this.metrics = null;
      }),

      this.props.subscribeStores([
        this.props.podStore,
      ]),
    ]);
  }

  loadMetrics = async () => {
    const { object: replicaSet } = this.props;

    this.metrics = await getMetricsForReplicaSets([replicaSet], replicaSet.getNs(), "");
  };

  render() {
    const { object: replicaSet, podStore, replicaSetStore, getActiveClusterEntity } = this.props;

    if (!replicaSet) {
      return null;
    }

    if (!(replicaSet instanceof ReplicaSet)) {
      logger.error("[ReplicaSetDetails]: passed object that is not an instanceof ReplicaSet", replicaSet);

      return null;
    }

    const { availableReplicas, replicas } = replicaSet.status ?? {};
    const selectors = replicaSet.getSelectors();
    const nodeSelector = replicaSet.getNodeSelectors();
    const images = replicaSet.getImages();
    const childPods = replicaSetStore.getChildPods(replicaSet);
    const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.ReplicaSet);

    return (
      <div className="ReplicaSetDetails">
        {!isMetricHidden && podStore.isLoaded && (
          <ResourceMetrics
            loader={this.loadMetrics}
            tabs={podMetricTabs}
            object={replicaSet}
            metrics={this.metrics}
          >
            <PodCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={replicaSet}/>
        {selectors.length > 0 && (
          <DrawerItem name="Selector" labelsOnly>
            {
              selectors.map(label => <Badge key={label} label={label}/>)
            }
          </DrawerItem>
        )}
        {nodeSelector.length > 0 && (
          <DrawerItem name="Node Selector" labelsOnly>
            {
              nodeSelector.map(label => <Badge key={label} label={label}/>)
            }
          </DrawerItem>
        )}
        {images.length > 0 && (
          <DrawerItem name="Images">
            {
              images.map(image => <p key={image}>{image}</p>)
            }
          </DrawerItem>
        )}
        <DrawerItem name="Replicas">
          {`${availableReplicas || 0} current / ${replicas || 0} desired`}
        </DrawerItem>
        <PodDetailsTolerations workload={replicaSet}/>
        <PodDetailsAffinities workload={replicaSet}/>
        <DrawerItem name="Pod Status" className="pod-status">
          <PodDetailsStatuses pods={childPods}/>
        </DrawerItem>
        <ResourceMetricsText metrics={this.metrics}/>
        <PodDetailsList pods={childPods} owner={replicaSet}/>
      </div>
    );
  }
}

export const ReplicaSetDetails = withInjectables<Dependencies, ReplicaSetDetailsProps>(NonInjectedReplicaSetDetails, {
  getProps: (di, props) => ({
    ...props,
    subscribeStores: di.inject(subscribeStoresInjectable),
    podStore: di.inject(podStoreInjectable),
    replicaSetStore: di.inject(replicaSetStoreInjectable),
    getActiveClusterEntity: di.inject(getActiveClusterEntityInjectable),
  }),
});
