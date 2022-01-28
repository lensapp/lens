/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import React, { useEffect, useState } from "react";
import kebabCase from "lodash/kebabCase";
import { observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import { Deployment, getMetricsForDeployments, IPodMetrics } from "../../../common/k8s-api/endpoints";
import { PodDetailsTolerations } from "../+pods/details-tolerations";
import { PodDetailsAffinities } from "../+pods/details-affinities";
import type { PodStore } from "../+pods/store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import type { DeploymentStore } from "./store";
import { PodCharts, podMetricTabs } from "../+pods/charts";
import { reaction } from "mobx";
import { PodDetailsList } from "../+pods/details-list";
import { KubeObjectMeta } from "../kube-object-meta";
import type { ReplicaSetStore } from "../+replica-sets/store";
import { DeploymentReplicaSets } from "./details-replica-sets";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { cssNames, disposer } from "../../utils";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import podStoreInjectable from "../+pods/store.injectable";
import deploymentStoreInjectable from "./store.injectable";
import replicaSetStoreInjectable from "../+replica-sets/store.injectable";
import isMetricHiddenInjectable from "../../utils/is-metrics-hidden.injectable";
import type { KubeWatchApi } from "../../kube-watch-api/kube-watch-api";
import kubeWatchApiInjectable from "../../kube-watch-api/kube-watch-api.injectable";

export interface DeploymentDetailsProps extends KubeObjectDetailsProps<Deployment> {
}

interface Dependencies {
  podStore: PodStore;
  deploymentStore: DeploymentStore;
  replicaSetStore: ReplicaSetStore;
  isMetricHidden: boolean;
  kubeWatchApi: KubeWatchApi;
}

const NonInjectedDeploymentDetails = observer(({ kubeWatchApi, isMetricHidden, podStore, deploymentStore, replicaSetStore, className, object: deployment }: Dependencies & DeploymentDetailsProps) => {
  const [metrics, setMetrics] = useState<IPodMetrics | null>(null);

  useEffect(() => disposer(
    reaction(() => deployment, () => setMetrics(null)),
    kubeWatchApi.subscribeStores([
      podStore,
      replicaSetStore,
    ]),
  ), []);

  if (!deployment) {
    return null;
  }

  if (!(deployment instanceof Deployment)) {
    logger.error("[DeploymentDetails]: passed object that is not an instanceof Deployment", deployment);

    return null;
  }

  const loadMetrics = async () => {
    setMetrics(await getMetricsForDeployments([deployment], deployment.getNs(), ""));
  };

  const { status, spec } = deployment;
  const nodeSelector = deployment.getNodeSelectors();
  const selectors = deployment.getSelectors();
  const childPods = deploymentStore.getChildPods(deployment);
  const replicaSets = replicaSetStore.getReplicaSetsByOwner(deployment);

  return (
    <div className={cssNames("DeploymentDetails", className)}>
      {(!isMetricHidden && podStore.isLoaded) && (
        <ResourceMetrics
          loader={loadMetrics}
          tabs={podMetricTabs}
          object={deployment}
          metrics={metrics}
        >
          <PodCharts/>
        </ResourceMetrics>
      )}
      <KubeObjectMeta object={deployment}/>
      <DrawerItem name="Replicas">
        {`${spec.replicas} desired, ${status.updatedReplicas || 0} updated`},{" "}
        {`${status.replicas || 0} total, ${status.availableReplicas || 0} available`},{" "}
        {`${status.unavailableReplicas || 0} unavailable`}
      </DrawerItem>
      {selectors.length > 0 &&
        <DrawerItem name="Selector" labelsOnly>
          {
            selectors.map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
      }
      {nodeSelector.length > 0 &&
        <DrawerItem name="Node Selector">
          {
            nodeSelector.map(label => (
              <Badge key={label} label={label}/>
            ))
          }
        </DrawerItem>
      }
      <DrawerItem name="Strategy Type">
        {spec.strategy.type}
      </DrawerItem>
      <DrawerItem name="Conditions" className="conditions" labelsOnly>
        {
          deployment.getConditions()
            .map(({ type, message, lastTransitionTime, status }) => (
              <Badge
                key={type}
                label={type}
                disabled={status === "False"}
                className={kebabCase(type)}
                tooltip={(
                  <>
                    <p>{message}</p>
                    <p>Last transition time: {lastTransitionTime}</p>
                  </>
                )}
              />
            ))
        }
      </DrawerItem>
      <PodDetailsTolerations workload={deployment}/>
      <PodDetailsAffinities workload={deployment}/>
      <ResourceMetricsText metrics={metrics}/>
      <DeploymentReplicaSets replicaSets={replicaSets}/>
      <PodDetailsList
        pods={childPods}
        owner={deployment}
        isLoaded={podStore.isLoaded}
      />
    </div>
  );
});

export const DeploymentDetails = withInjectables<Dependencies, DeploymentDetailsProps>(NonInjectedDeploymentDetails, {
  getProps: (di, props) => ({
    podStore: di.inject(podStoreInjectable),
    deploymentStore: di.inject(deploymentStoreInjectable),
    replicaSetStore: di.inject(replicaSetStoreInjectable),
    isMetricHidden: di.inject(isMetricHiddenInjectable, {
      metricType: ClusterMetricsResourceType.Deployment,
    }),
    kubeWatchApi: di.inject(kubeWatchApiInjectable),
    ...props,
  }),
});
