/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./deployment-details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import type { PodMetricData } from "../../../common/k8s-api/endpoints";
import { Deployment, getMetricsForDeployments } from "../../../common/k8s-api/endpoints";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import type { DeploymentStore } from "./store";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { makeObservable, observable, reaction } from "mobx";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object-meta";
import type { ReplicaSetStore } from "../+workloads-replicasets/store";
import { DeploymentReplicaSets } from "./deployment-replicasets";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import type { PodStore } from "../+workloads-pods/store";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import replicaSetStoreInjectable from "../+workloads-replicasets/store.injectable";
import deploymentStoreInjectable from "./store.injectable";
import type { GetActiveClusterEntity } from "../../api/catalog/entity/get-active-cluster-entity.injectable";
import getActiveClusterEntityInjectable from "../../api/catalog/entity/get-active-cluster-entity.injectable";

export interface DeploymentDetailsProps extends KubeObjectDetailsProps<Deployment> {
}

interface Dependencies {
  subscribeStores: SubscribeStores;
  podStore: PodStore;
  replicaSetStore: ReplicaSetStore;
  deploymentStore: DeploymentStore;
  getActiveClusterEntity: GetActiveClusterEntity;
}

@observer
class NonInjectedDeploymentDetails extends React.Component<DeploymentDetailsProps & Dependencies> {
  @observable metrics: PodMetricData | null = null;

  constructor(props: DeploymentDetailsProps & Dependencies) {
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
        this.props.replicaSetStore,
      ]),
    ]);
  }

  loadMetrics = async () => {
    const { object: deployment } = this.props;

    this.metrics = await getMetricsForDeployments([deployment], deployment.getNs(), "");
  };

  render() {
    const { object: deployment, podStore, replicaSetStore, deploymentStore, getActiveClusterEntity } = this.props;

    if (!deployment) {
      return null;
    }

    if (!(deployment instanceof Deployment)) {
      logger.error("[DeploymentDetails]: passed object that is not an instanceof Deployment", deployment);

      return null;
    }

    const { status, spec } = deployment;
    const nodeSelector = deployment.getNodeSelectors();
    const selectors = deployment.getSelectors();
    const childPods = deploymentStore.getChildPods(deployment);
    const replicaSets = replicaSetStore.getReplicaSetsByOwner(deployment);
    const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.Deployment);

    return (
      <div className="DeploymentDetails">
        {!isMetricHidden && podStore.isLoaded && (
          <ResourceMetrics
            loader={this.loadMetrics}
            tabs={podMetricTabs}
            object={deployment}
            metrics={this.metrics}
          >
            <PodCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={deployment}/>
        <DrawerItem name="Replicas">
          {`${spec.replicas} desired, ${status?.updatedReplicas ?? 0} updated, `}
          {`${status?.replicas ?? 0} total, ${status?.availableReplicas ?? 0} available, `}
          {`${status?.unavailableReplicas ?? 0} unavailable`}
        </DrawerItem>
        {selectors.length > 0 && (
          <DrawerItem name="Selector" labelsOnly>
            {
              selectors.map(label => <Badge key={label} label={label}/>)
            }
          </DrawerItem>
        )}
        {nodeSelector.length > 0 && (
          <DrawerItem name="Node Selector">
            {
              nodeSelector.map(label => (
                <Badge key={label} label={label}/>
              ))
            }
          </DrawerItem>
        )}
        <DrawerItem name="Strategy Type">
          {spec.strategy.type}
        </DrawerItem>
        <DrawerItem
          name="Conditions"
          className="conditions"
          labelsOnly
        >
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
                      <p>
                        {`Last transition time: ${lastTransitionTime}`}
                      </p>
                    </>
                  )} />
              ))
          }
        </DrawerItem>
        <PodDetailsTolerations workload={deployment}/>
        <PodDetailsAffinities workload={deployment}/>
        <ResourceMetricsText metrics={this.metrics}/>
        <DeploymentReplicaSets replicaSets={replicaSets}/>
        <PodDetailsList pods={childPods} owner={deployment}/>
      </div>
    );
  }
}

export const DeploymentDetails = withInjectables<Dependencies, DeploymentDetailsProps>(NonInjectedDeploymentDetails, {
  getProps: (di, props) => ({
    ...props,
    subscribeStores: di.inject(subscribeStoresInjectable),
    podStore: di.inject(podStoreInjectable),
    replicaSetStore: di.inject(replicaSetStoreInjectable),
    deploymentStore: di.inject(deploymentStoreInjectable),
    getActiveClusterEntity: di.inject(getActiveClusterEntityInjectable),
  }),
});

