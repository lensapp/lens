/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./daemonset-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import { PodDetailsStatuses } from "../+workloads-pods/pod-details-statuses";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import type { DaemonSetStore } from "./store";
import type { PodStore } from "../+workloads-pods/store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { DaemonSet, getMetricsForDaemonSets, type PodMetricData } from "../../../common/k8s-api/endpoints";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { makeObservable, observable, reaction } from "mobx";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object-meta";
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import daemonSetStoreInjectable from "./store.injectable";
import podStoreInjectable from "../+workloads-pods/store.injectable";

export interface DaemonSetDetailsProps extends KubeObjectDetailsProps<DaemonSet> {
}

interface Dependencies {
  subscribeStores: SubscribeStores;
  daemonSetStore: DaemonSetStore;
  podStore: PodStore;
}

@observer
class NonInjectedDaemonSetDetails extends React.Component<DaemonSetDetailsProps & Dependencies> {
  @observable metrics: PodMetricData | null = null;

  constructor(props: DaemonSetDetailsProps & Dependencies) {
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
    const { object: daemonSet } = this.props;

    this.metrics = await getMetricsForDaemonSets([daemonSet], daemonSet.getNs(), "");
  };

  render() {
    const { object: daemonSet, daemonSetStore, podStore } = this.props;

    if (!daemonSet) {
      return null;
    }

    if (!(daemonSet instanceof DaemonSet)) {
      logger.error("[DaemonSetDetails]: passed object that is not an instanceof DaemonSet", daemonSet);

      return null;
    }

    const { spec } = daemonSet;
    const selectors = daemonSet.getSelectors();
    const images = daemonSet.getImages();
    const nodeSelector = daemonSet.getNodeSelectors();
    const childPods = daemonSetStore.getChildPods(daemonSet);
    const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.DaemonSet);

    return (
      <div className="DaemonSetDetails">
        {!isMetricHidden && podStore.isLoaded && (
          <ResourceMetrics
            loader={this.loadMetrics}
            tabs={podMetricTabs}
            object={daemonSet}
            metrics={this.metrics}
          >
            <PodCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={daemonSet}/>
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
              nodeSelector.map(label => (<Badge key={label} label={label}/>))
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
        <DrawerItem name="Strategy Type">
          {spec.updateStrategy.type}
        </DrawerItem>
        <PodDetailsTolerations workload={daemonSet}/>
        <PodDetailsAffinities workload={daemonSet}/>
        <DrawerItem name="Pod Status" className="pod-status">
          <PodDetailsStatuses pods={childPods}/>
        </DrawerItem>
        <ResourceMetricsText metrics={this.metrics}/>
        <PodDetailsList pods={childPods} owner={daemonSet}/>
      </div>
    );
  }
}

export const DaemonSetDetails = withInjectables<Dependencies, DaemonSetDetailsProps>(NonInjectedDaemonSetDetails, {
  getProps: (di, props) => ({
    ...props,
    subscribeStores: di.inject(subscribeStoresInjectable),
    daemonSetStore: di.inject(daemonSetStoreInjectable),
    podStore: di.inject(podStoreInjectable),
  }),
});
