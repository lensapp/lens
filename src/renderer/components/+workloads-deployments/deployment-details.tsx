/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./deployment-details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import { Deployment, deploymentApi, podsApi, replicaSetApi } from "../../api/endpoints";
import { cssNames } from "../../utils";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import type { KubeObjectDetailsProps } from "../kube-object";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { reaction } from "mobx";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { ResourceType } from "../cluster-settings/components/cluster-metrics-setting";
import { ClusterStore } from "../../../common/cluster-store";
import type { DeploymentStore } from ".";
import type { PodsStore } from "../+workloads-pods";
import { ApiManager } from "../../api/api-manager";
import type { ReplicaSetStore } from "../+workloads-replicasets";
import { DeploymentReplicaSets } from "./deployment-replicasets";

interface Props extends KubeObjectDetailsProps<Deployment> {
}

@observer
export class DeploymentDetails extends React.Component<Props> {
  private get podsStore() {
    return ApiManager.getInstance().getStore<PodsStore>(podsApi);
  }

  private get replicaSetStore() {
    return ApiManager.getInstance().getStore<ReplicaSetStore>(replicaSetApi);
  }

  private get deploymentStore() {
    return ApiManager.getInstance().getStore<DeploymentStore>(deploymentApi);
  }

  @disposeOnUnmount
  clean = reaction(() => this.props.object, () => {
    this.deploymentStore.reset();
  });

  componentDidMount() {
    this.podsStore.reloadAll();
    this.replicaSetStore.reloadAll();
  }

  componentWillUnmount() {
    this.deploymentStore.reset();
  }

  render() {
    const { object: deployment } = this.props;

    if (!deployment) return null;
    const { status, spec } = deployment;
    const nodeSelector = deployment.getNodeSelectors();
    const selectors = deployment.getSelectors();
    const childPods = this.deploymentStore.getChildPods(deployment);
    const replicaSets = this.replicaSetStore.getReplicaSetsByOwner(deployment);
    const metrics = this.deploymentStore.metrics;
    const isMetricHidden = ClusterStore.getInstance().isMetricHidden(ResourceType.Deployment);

    return (
      <div className="DeploymentDetails">
        {!isMetricHidden && this.podsStore.isLoaded && (
          <ResourceMetrics
            loader={() => this.deploymentStore.loadMetrics(deployment)}
            tabs={podMetricTabs} object={deployment} params={{ metrics }}
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
        <DrawerItem name="Selector" labelsOnly hidden={selectors.length === 0}>
          {selectors.map(label => <Badge key={label} label={label}/>)}
        </DrawerItem>
        <DrawerItem name="Node Selector" hidden={nodeSelector.length === 0}>
          {nodeSelector.map(label => <Badge key={label} label={label}/>)}
        </DrawerItem>
        <DrawerItem name="Strategy Type">
          {spec.strategy.type}
        </DrawerItem>
        <DrawerItem name="Conditions" className="conditions" labelsOnly>
          {
            deployment.getConditions().map(condition => {
              const { type, message, lastTransitionTime, status } = condition;

              return (
                <Badge
                  key={type}
                  label={type}
                  className={cssNames({ disabled: status === "False" }, kebabCase(type))}
                  tooltip={(
                    <>
                      <p>{message}</p>
                      <p>Last transition time: {lastTransitionTime}</p>
                    </>
                  )}
                />
              );
            })
          }
        </DrawerItem>
        <PodDetailsTolerations workload={deployment}/>
        <PodDetailsAffinities workload={deployment}/>
        <ResourceMetricsText metrics={metrics}/>
        <DeploymentReplicaSets replicaSets={replicaSets}/>
        <PodDetailsList pods={childPods} owner={deployment}/>
      </div>
    );
  }
}
