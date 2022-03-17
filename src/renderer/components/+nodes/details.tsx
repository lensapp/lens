/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import React from "react";
import upperFirst from "lodash/upperFirst";
import kebabCase from "lodash/kebabCase";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem, DrawerItemLabels } from "../drawer";
import { Badge } from "../badge";
import { ResourceMetrics } from "../resource-metrics";
import { podsStore } from "../+workloads-pods/pods.store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import type { ClusterMetricData } from "../../../common/k8s-api/endpoints";
import { formatNodeTaint, getMetricsByNodeNames, Node } from "../../../common/k8s-api/endpoints";
import { NodeCharts } from "./node-charts";
import { makeObservable, observable, reaction } from "mobx";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object-meta";
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { NodeDetailsResources } from "./details-resources";
import { DrawerTitle } from "../drawer/drawer-title";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import kubeWatchApiInjectable from "../../kube-watch-api/kube-watch-api.injectable";
import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";

export interface NodeDetailsProps extends KubeObjectDetailsProps<Node> {
}

interface Dependencies {
  subscribeStores: SubscribeStores;
}

@observer
class NonInjectedNodeDetails extends React.Component<NodeDetailsProps & Dependencies> {
  @observable metrics: Partial<ClusterMetricData> | null = null;

  constructor(props: NodeDetailsProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.object.getName(), () => {
        this.metrics = null;
      }),

      this.props.subscribeStores([
        podsStore,
      ]),
    ]);
  }

  loadMetrics = async () => {
    const { object: node } = this.props;

    this.metrics = await getMetricsByNodeNames([node.getName()]);
  };

  render() {
    const { object: node } = this.props;

    if (!node) {
      return null;
    }

    if (!(node instanceof Node)) {
      logger.error("[NodeDetails]: passed object that is not an instanceof Node", node);

      return null;
    }

    const { nodeInfo, addresses } = node.status ?? {};
    const conditions = node.getActiveConditions();
    const taints = node.getTaints();
    const childPods = podsStore.getPodsByNode(node.getName());
    const { metrics } = this;
    const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.Node);

    return (
      <div className="NodeDetails">
        {!isMetricHidden && podsStore.isLoaded && (
          <ResourceMetrics
            loader={this.loadMetrics}
            tabs={[
              "CPU",
              "Memory",
              "Disk",
              "Pods",
            ]}
            object={node}
            metrics={metrics}
          >
            <NodeCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={node} hideFields={["labels", "annotations", "uid", "resourceVersion", "selfLink"]}/>
        {addresses && (
          <DrawerItem name="Addresses">
            {
              addresses.map(({ type, address }) => (
                <p key={type}>
                  {`${type}: ${address}`}
                </p>
              ))
            }
          </DrawerItem>
        )}
        {nodeInfo && (
          <>
            <DrawerItem name="OS">
              {`${nodeInfo.operatingSystem} (${nodeInfo.architecture})`}
            </DrawerItem>
            <DrawerItem name="OS Image">
              {nodeInfo.osImage}
            </DrawerItem>
            <DrawerItem name="Kernel version">
              {nodeInfo.kernelVersion}
            </DrawerItem>
            <DrawerItem name="Container runtime">
              {nodeInfo.containerRuntimeVersion}
            </DrawerItem>
            <DrawerItem name="Kubelet version">
              {nodeInfo.kubeletVersion}
            </DrawerItem>
          </>
        )}
        <DrawerItemLabels
          name="Labels"
          labels={node.getLabels()}
        />
        <DrawerItemLabels
          name="Annotations"
          labels={node.getAnnotations()}
        />
        {taints.length > 0 && (
          <DrawerItem name="Taints" labelsOnly>
            {taints.map(taint => <Badge key={taint.key} label={formatNodeTaint(taint)} />)}
          </DrawerItem>
        )}
        {conditions && (
          <DrawerItem
            name="Conditions"
            className="conditions"
            labelsOnly
          >
            {conditions.map(condition => (
              <Badge
                key={condition.type}
                label={condition.type}
                className={kebabCase(condition.type)}
                tooltip={{
                  formatters: {
                    tableView: true,
                  },
                  children: Object.entries(condition)
                    .map(([key, value]) => (
                      <div key={key} className="flex gaps align-center">
                        <div className="name">{upperFirst(key)}</div>
                        <div className="value">{value}</div>
                      </div>
                    )),
                }}
              />
            ))}
          </DrawerItem>
        )}
        <DrawerTitle>Capacity</DrawerTitle>
        <NodeDetailsResources node={node} type="capacity"/>
        <DrawerTitle>Allocatable</DrawerTitle>
        <NodeDetailsResources node={node} type="allocatable"/>
        <PodDetailsList
          pods={childPods}
          owner={node}
          maxCpu={node.getCpuCapacity()}
          maxMemory={node.getMemoryCapacity()}
        />
      </div>
    );
  }
}

export const NodeDetails = withInjectables<Dependencies, NodeDetailsProps>(
  NonInjectedNodeDetails,

  {
    getProps: (di, props) => ({
      subscribeStores: di.inject(kubeWatchApiInjectable).subscribeStores,
      ...props,
    }),
  },
);

