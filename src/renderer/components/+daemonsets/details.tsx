/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import { PodDetailsStatuses } from "../+pods/details-statuses";
import { PodDetailsTolerations } from "../+pods/details-tolerations";
import { PodDetailsAffinities } from "../+pods/details-affinities";
import type { DaemonSetStore } from "./store";
import type { PodStore } from "../+pods/store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { DaemonSet, getMetricsForDaemonSets, IPodMetrics } from "../../../common/k8s-api/endpoints";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import { PodCharts, podMetricTabs } from "../+pods/charts";
import { PodDetailsList } from "../+pods/details-list";
import { KubeObjectMeta } from "../kube-object-meta";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import daemonSetStoreInjectable from "./store.injectable";
import podStoreInjectable from "../+pods/store.injectable";
import isMetricHiddenInjectable from "../../utils/is-metrics-hidden.injectable";
import type { KubeWatchApi } from "../../kube-watch-api/kube-watch-api";
import kubeWatchApiInjectable from "../../kube-watch-api/kube-watch-api.injectable";

export interface DaemonSetDetailsProps extends KubeObjectDetailsProps<DaemonSet> {
}

interface Dependencies {
  daemonSetStore: DaemonSetStore;
  podStore: PodStore;
  isMetricHidden: boolean;
  kubeWatchApi: KubeWatchApi;
}

const NonInjectedDaemonSetDetails = observer(({ kubeWatchApi, isMetricHidden, podStore, daemonSetStore, object: daemonSet }: Dependencies & DaemonSetDetailsProps) => {
  const [metrics, setMetrics] = useState<IPodMetrics | null>(null);

  useEffect(() => setMetrics(null), [daemonSet]);
  useEffect(() => (
    kubeWatchApi.subscribeStores([
      podStore,
    ])
  ), []);

  if (!daemonSet) {
    return null;
  }

  if (!(daemonSet instanceof DaemonSet)) {
    logger.error("[DaemonSetDetails]: passed object that is not an instanceof DaemonSet", daemonSet);

    return null;
  }

  const loadMetrics = async () => {
    setMetrics(await getMetricsForDaemonSets([daemonSet], daemonSet.getNs(), ""));
  };

  const { spec } = daemonSet;
  const selectors = daemonSet.getSelectors();
  const images = daemonSet.getImages();
  const nodeSelector = daemonSet.getNodeSelectors();
  const childPods = daemonSetStore.getChildPods(daemonSet);

  return (
    <div className="DaemonSetDetails">
      {(!isMetricHidden && podStore.isLoaded) && (
        <ResourceMetrics
          loader={loadMetrics}
          tabs={podMetricTabs}
          object={daemonSet}
          metrics={metrics}
        >
          <PodCharts/>
        </ResourceMetrics>
      )}
      <KubeObjectMeta object={daemonSet}/>
      {selectors.length > 0 &&
        <DrawerItem name="Selector" labelsOnly>
          {
            selectors.map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
      }
      {nodeSelector.length > 0 &&
        <DrawerItem name="Node Selector" labelsOnly>
          {
            nodeSelector.map(label => (<Badge key={label} label={label}/>))
          }
        </DrawerItem>
      }
      {images.length > 0 &&
        <DrawerItem name="Images">
          {
            images.map(image => <p key={image}>{image}</p>)
          }
        </DrawerItem>
      }
      <DrawerItem name="Strategy Type">
        {spec.updateStrategy.type}
      </DrawerItem>
      <PodDetailsTolerations workload={daemonSet}/>
      <PodDetailsAffinities workload={daemonSet}/>
      <DrawerItem name="Pod Status" className="pod-status">
        <PodDetailsStatuses pods={childPods}/>
      </DrawerItem>
      <ResourceMetricsText metrics={metrics}/>
      <PodDetailsList
        pods={childPods}
        owner={daemonSet}
        isLoaded={podStore.isLoaded}
      />
    </div>
  );
});

export const DaemonSetDetails = withInjectables<Dependencies, DaemonSetDetailsProps>(NonInjectedDaemonSetDetails, {
  getProps: (di, props) => ({
    daemonSetStore: di.inject(daemonSetStoreInjectable),
    podStore: di.inject(podStoreInjectable),
    isMetricHidden: di.inject(isMetricHiddenInjectable, {
      metricType: ClusterMetricsResourceType.DaemonSet,
    }),
    kubeWatchApi: di.inject(kubeWatchApiInjectable),
    ...props,
  }),
});
