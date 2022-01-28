/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import React, { useEffect, useState } from "react";
import upperFirst from "lodash/upperFirst";
import kebabCase from "lodash/kebabCase";
import { observer } from "mobx-react";
import { DrawerItem, DrawerItemLabels } from "../drawer";
import { Badge } from "../badge";
import { ResourceMetrics } from "../resource-metrics";
import type { PodStore } from "../+pods/store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { formatNodeTaint, getMetricsByNodeNames, IClusterMetrics, Node } from "../../../common/k8s-api/endpoints";
import { NodeCharts } from "./charts";
import { PodDetailsList } from "../+pods/details-list";
import { KubeObjectMeta } from "../kube-object-meta";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { NodeDetailsResources } from "./resource-details";
import { DrawerTitle } from "../drawer/drawer-title";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import podStoreInjectable from "../+pods/store.injectable";
import isMetricHiddenInjectable from "../../utils/is-metrics-hidden.injectable";
import type { KubeWatchApi } from "../../kube-watch-api/kube-watch-api";
import kubeWatchApiInjectable from "../../kube-watch-api/kube-watch-api.injectable";

export interface NodeDetailsProps extends KubeObjectDetailsProps<Node> {
}

interface Dependencies {
  podStore: PodStore;
  isMetricHidden: boolean;
  kubeWatchApi: KubeWatchApi;
}

const NonInjectedNodeDetails = observer(({ kubeWatchApi, isMetricHidden, podStore, object: node }: Dependencies & NodeDetailsProps) => {
  const [metrics, setMetrics] = useState<IClusterMetrics | null>(null);

  useEffect(() => setMetrics(null), [node]);
  useEffect(() => (
    kubeWatchApi.subscribeStores([
      podStore,
    ])
  ), []);

  const loadMetrics = async () => {
    setMetrics(await getMetricsByNodeNames([node.getName()]));
  };

  if (!node) {
    return null;
  }

  if (!(node instanceof Node)) {
    logger.error("[NodeDetails]: passed object that is not an instanceof Node", node);

    return null;
  }

  const { status } = node;
  const { nodeInfo, addresses } = status;
  const conditions = node.getActiveConditions();
  const taints = node.getTaints();
  const childPods = podStore.getPodsByNode(node.getName());
  const metricTabs = [
    "CPU",
    "Memory",
    "Disk",
    "Pods",
  ];

  return (
    <div className="NodeDetails">
      {(!isMetricHidden && podStore.isLoaded) && (
        <ResourceMetrics
          loader={loadMetrics}
          tabs={metricTabs}
          object={node}
          metrics={metrics}
        >
          <NodeCharts/>
        </ResourceMetrics>
      )}
      <KubeObjectMeta object={node} hideFields={["labels", "annotations", "uid", "resourceVersion", "selfLink"]}/>
      {addresses &&
        <DrawerItem name="Addresses">
          {
            addresses.map(({ type, address }) => (
              <p key={type}>{type}: {address}</p>
            ))
          }
        </DrawerItem>
      }
      <DrawerItem name="OS">
        {nodeInfo.operatingSystem} ({nodeInfo.architecture})
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
      {conditions &&
        <DrawerItem name="Conditions" className="conditions" labelsOnly>
          {
            conditions.map(condition => (
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
                }} />
            ))
          }
        </DrawerItem>
      }
      <DrawerTitle title="Capacity"/>
      <NodeDetailsResources node={node} type={"capacity"}/>
      <DrawerTitle title="Allocatable"/>
      <NodeDetailsResources node={node} type={"allocatable"}/>
      <PodDetailsList
        pods={childPods}
        owner={node}
        maxCpu={node.getCpuCapacity()}
        maxMemory={node.getMemoryCapacity()}
        isLoaded={podStore.isLoaded}
      />
    </div>
  );
});

export const NodeDetails = withInjectables<Dependencies, NodeDetailsProps>(NonInjectedNodeDetails, {
  getProps: (di, props) => ({
    podStore: di.inject(podStoreInjectable),
    isMetricHidden: di.inject(isMetricHiddenInjectable, {
      metricType: ClusterMetricsResourceType.Node,
    }),
    kubeWatchApi: di.inject(kubeWatchApiInjectable),
    ...props,
  }),
});

