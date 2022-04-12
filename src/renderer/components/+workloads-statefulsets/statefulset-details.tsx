/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./statefulset-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { makeObservable, observable, reaction } from "mobx";
import { Badge } from "../badge";
import { DrawerItem } from "../drawer";
import { PodDetailsStatuses } from "../+workloads-pods/pod-details-statuses";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import type { StatefulSetStore } from "./store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import type { PodMetricData } from "../../../common/k8s-api/endpoints";
import { getMetricsForStatefulSets, StatefulSet } from "../../../common/k8s-api/endpoints";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object-meta";
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import type { PodStore } from "../+workloads-pods/store";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import statefulSetStoreInjectable from "./store.injectable";

export interface StatefulSetDetailsProps extends KubeObjectDetailsProps<StatefulSet> {
}

interface Dependencies {
  subscribeStores: SubscribeStores;
  podStore: PodStore;
  statefulSetStore: StatefulSetStore;
}

@observer
class NonInjectedStatefulSetDetails extends React.Component<StatefulSetDetailsProps & Dependencies> {
  @observable metrics: PodMetricData | null = null;

  constructor(props: StatefulSetDetailsProps & Dependencies) {
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
    const { object: statefulSet } = this.props;

    this.metrics = await getMetricsForStatefulSets([statefulSet], statefulSet.getNs(), "");
  };

  render() {
    const { object: statefulSet, podStore, statefulSetStore } = this.props;

    if (!statefulSet) {
      return null;
    }

    if (!(statefulSet instanceof StatefulSet)) {
      logger.error("[StatefulSetDetails]: passed object that is not an instanceof StatefulSet", statefulSet);

      return null;
    }

    const images = statefulSet.getImages();
    const selectors = statefulSet.getSelectors();
    const nodeSelector = statefulSet.getNodeSelectors();
    const childPods = statefulSetStore.getChildPods(statefulSet);
    const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.StatefulSet);

    return (
      <div className="StatefulSetDetails">
        {!isMetricHidden && podStore.isLoaded && (
          <ResourceMetrics
            loader={this.loadMetrics}
            tabs={podMetricTabs}
            object={statefulSet}
            metrics={this.metrics}
          >
            <PodCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={statefulSet}/>
        {selectors.length && (
          <DrawerItem name="Selector" labelsOnly>
            {
              selectors.map(label => <Badge key={label} label={label}/>)
            }
          </DrawerItem>
        )}
        {nodeSelector.length > 0 && (
          <DrawerItem name="Node Selector" labelsOnly>
            {
              nodeSelector.map(label => (
                <Badge key={label} label={label}/>
              ))
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
        <PodDetailsTolerations workload={statefulSet}/>
        <PodDetailsAffinities workload={statefulSet}/>
        <DrawerItem name="Pod Status" className="pod-status">
          <PodDetailsStatuses pods={childPods}/>
        </DrawerItem>
        <ResourceMetricsText metrics={this.metrics}/>
        <PodDetailsList pods={childPods} owner={statefulSet}/>
      </div>
    );
  }
}

export const StatefulSetDetails = withInjectables<Dependencies, StatefulSetDetailsProps>(NonInjectedStatefulSetDetails, {
  getProps: (di, props) => ({
    ...props,
    subscribeStores: di.inject(subscribeStoresInjectable),
    podStore: di.inject(podStoreInjectable),
    statefulSetStore: di.inject(statefulSetStoreInjectable),
  }),
});

