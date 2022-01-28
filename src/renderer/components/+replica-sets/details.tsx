/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";
import React, { useEffect, useState } from "react";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import type { ReplicaSetStore } from "./store";
import { PodDetailsStatuses } from "../+pods/details-statuses";
import { PodDetailsTolerations } from "../+pods/details-tolerations";
import { PodDetailsAffinities } from "../+pods/details-affinities";
import { observer } from "mobx-react";
import type { PodStore } from "../+pods/store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { getMetricsForReplicaSets, IPodMetrics, ReplicaSet } from "../../../common/k8s-api/endpoints";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import { PodCharts, podMetricTabs } from "../+pods/charts";
import { PodDetailsList } from "../+pods/details-list";
import { KubeObjectMeta } from "../kube-object-meta";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import podStoreInjectable from "../+pods/store.injectable";
import replicaSetStoreInjectable from "./store.injectable";
import isMetricHiddenInjectable from "../../utils/is-metrics-hidden.injectable";
import kubeWatchApiInjectable from "../../kube-watch-api/kube-watch-api.injectable";
import type { KubeWatchApi } from "../../kube-watch-api/kube-watch-api";

export interface ReplicaSetDetailsProps extends KubeObjectDetailsProps<ReplicaSet> {
}

interface Dependencies {
  replicaSetStore: ReplicaSetStore;
  podStore: PodStore;
  isMetricHidden: boolean;
  kubeWatchApi: KubeWatchApi;
}

const NonInjectedReplicaSetDetails = observer(({ kubeWatchApi, isMetricHidden, podStore, replicaSetStore, object: replicaSet }: Dependencies & ReplicaSetDetailsProps) => {
  const [metrics, setMetrics] = useState<IPodMetrics | null>(null);

  useEffect(() => setMetrics(null), [replicaSet]);
  useEffect(() => (
    kubeWatchApi.subscribeStores([
      podStore,
    ])
  ), []);

  const loadMetrics =async () => {
    setMetrics(await getMetricsForReplicaSets([replicaSet], replicaSet.getNs(), ""));
  };

  if (!replicaSet) {
    return null;
  }

  if (!(replicaSet instanceof ReplicaSet)) {
    logger.error("[ReplicaSetDetails]: passed object that is not an instanceof ReplicaSet", replicaSet);

    return null;
  }

  const { availableReplicas, replicas } = replicaSet.status;
  const selectors = replicaSet.getSelectors();
  const nodeSelector = replicaSet.getNodeSelectors();
  const images = replicaSet.getImages();
  const childPods = replicaSetStore.getChildPods(replicaSet);

  return (
    <div className="ReplicaSetDetails">
      {(!isMetricHidden && podStore.isLoaded) && (
        <ResourceMetrics
          loader={loadMetrics}
          tabs={podMetricTabs}
          object={replicaSet}
          metrics={metrics}
        >
          <PodCharts/>
        </ResourceMetrics>
      )}
      <KubeObjectMeta object={replicaSet}/>
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
            nodeSelector.map(label => <Badge key={label} label={label}/>)
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
      <DrawerItem name="Replicas">
        {`${availableReplicas || 0} current / ${replicas || 0} desired`}
      </DrawerItem>
      <PodDetailsTolerations workload={replicaSet}/>
      <PodDetailsAffinities workload={replicaSet}/>
      <DrawerItem name="Pod Status" className="pod-status">
        <PodDetailsStatuses pods={childPods}/>
      </DrawerItem>
      <ResourceMetricsText metrics={metrics}/>
      <PodDetailsList
        pods={childPods}
        owner={replicaSet}
        isLoaded={podStore.isLoaded}
      />
    </div>
  );
});

export const ReplicaSetDetails = withInjectables<Dependencies, ReplicaSetDetailsProps>(NonInjectedReplicaSetDetails, {
  getProps: (di, props) => ({
    podStore: di.inject(podStoreInjectable),
    replicaSetStore: di.inject(replicaSetStoreInjectable),
    isMetricHidden: di.inject(isMetricHiddenInjectable, {
      metricType: ClusterMetricsResourceType.ReplicaSet,
    }),
    kubeWatchApi: di.inject(kubeWatchApiInjectable),
    ...props,
  }),
});

