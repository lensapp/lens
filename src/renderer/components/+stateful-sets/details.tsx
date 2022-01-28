/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { Badge } from "../badge";
import { DrawerItem } from "../drawer";
import { PodDetailsStatuses } from "../+pods/details-statuses";
import { PodDetailsTolerations } from "../+pods/details-tolerations";
import { PodDetailsAffinities } from "../+pods/details-affinities";
import type { PodStore } from "../+pods/store";
import type { StatefulSetStore } from "./store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { getMetricsForStatefulSets, IPodMetrics, StatefulSet } from "../../../common/k8s-api/endpoints";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import { PodCharts, podMetricTabs } from "../+pods/charts";
import { PodDetailsList } from "../+pods/details-list";
import { KubeObjectMeta } from "../kube-object-meta";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import podStoreInjectable from "../+pods/store.injectable";
import statefulSetStoreInjectable from "./store.injectable";
import isMetricHiddenInjectable from "../../utils/is-metrics-hidden.injectable";
import type { KubeWatchApi } from "../../kube-watch-api/kube-watch-api";
import kubeWatchApiInjectable from "../../kube-watch-api/kube-watch-api.injectable";

export interface StatefulSetDetailsProps extends KubeObjectDetailsProps<StatefulSet> {
}

interface Dependencies {
  podStore: PodStore;
  statefulSetStore: StatefulSetStore;
  isMetricHidden: boolean;
  kubeWatchApi: KubeWatchApi;
}

const NonInjectedStatefulSetDetails = observer(({ kubeWatchApi, isMetricHidden, podStore, statefulSetStore, object: statefulSet }: Dependencies & StatefulSetDetailsProps) => {
  const [metrics, setMetrics] = useState<IPodMetrics>(null);

  useEffect(() => setMetrics(null), [statefulSet]);
  useEffect(() => (
    kubeWatchApi.subscribeStores([
      podStore,
    ])
  ), []);

  if (!statefulSet) {
    return null;
  }

  if (!(statefulSet instanceof StatefulSet)) {
    logger.error("[StatefulSetDetails]: passed object that is not an instanceof StatefulSet", statefulSet);

    return null;
  }

  const loadMetrics = async () => {
    setMetrics(await getMetricsForStatefulSets([statefulSet], statefulSet.getNs(), ""));
  };

  const images = statefulSet.getImages();
  const selectors = statefulSet.getSelectors();
  const nodeSelector = statefulSet.getNodeSelectors();
  const childPods = statefulSetStore.getChildPods(statefulSet);

  return (
    <div className="StatefulSetDetails">
      {(!isMetricHidden && podStore.isLoaded) && (
        <ResourceMetrics
          loader={loadMetrics}
          tabs={podMetricTabs}
          object={statefulSet}
          metrics={metrics}
        >
          <PodCharts/>
        </ResourceMetrics>
      )}
      <KubeObjectMeta object={statefulSet}/>
      {selectors.length &&
        <DrawerItem name="Selector" labelsOnly>
          {
            selectors.map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
      }
      {nodeSelector.length > 0 &&
        <DrawerItem name="Node Selector" labelsOnly>
          {
            nodeSelector.map(label => (
              <Badge key={label} label={label}/>
            ))
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
      <PodDetailsTolerations workload={statefulSet}/>
      <PodDetailsAffinities workload={statefulSet}/>
      <DrawerItem name="Pod Status" className="pod-status">
        <PodDetailsStatuses pods={childPods}/>
      </DrawerItem>
      <ResourceMetricsText metrics={metrics}/>
      <PodDetailsList
        pods={childPods}
        owner={statefulSet}
        isLoaded={podStore.isLoaded}
      />
    </div>
  );
});

export const StatefulSetDetails = withInjectables<Dependencies, StatefulSetDetailsProps>(NonInjectedStatefulSetDetails, {
  getProps: (di, props) => ({
    podStore: di.inject(podStoreInjectable),
    statefulSetStore: di.inject(statefulSetStoreInjectable),
    isMetricHidden: di.inject(isMetricHiddenInjectable, {
      metricType: ClusterMetricsResourceType.StatefulSet,
    }),
    kubeWatchApi: di.inject(kubeWatchApiInjectable),
    ...props,
  }),
});
