/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details-list.scss";

import React, { useEffect, useState } from "react";
import kebabCase from "lodash/kebabCase";
import { observer } from "mobx-react";
import type { Pod, PodMetrics, PodMetricsApi } from "../../../common/k8s-api/endpoints";
import { bytesToUnits, cpuUnitsToNumber, cssNames, interval, prevDefault, unitsToBytes } from "../../utils";
import { LineProgress } from "../line-progress";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { Spinner } from "../spinner";
import { DrawerTitle } from "../drawer";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { showDetails } from "../kube-detail-params";
import { withInjectables } from "@ogre-tools/injectable-react";
import podMetricsApiInjectable from "../../../common/k8s-api/endpoints/pod-metrics.api.injectable";
import logger from "../../../common/logger";

enum sortBy {
  name = "name",
  namespace = "namespace",
  cpu = "cpu",
  memory = "memory",
}

export interface PodDetailsListProps {
  pods: Pod[];
  owner: KubeObject;
  maxCpu?: number;
  maxMemory?: number;
  isLoaded: boolean;
}

interface Dependencies {
  podMetricsApi: PodMetricsApi;
}

const NonInjectedPodDetailsList = observer(({ pods, owner, maxCpu, maxMemory, isLoaded, podMetricsApi }: Dependencies & PodDetailsListProps) => {
  const [kubeMetrics, setKubeMetrics] = useState<PodMetrics[]>([]);
  const [metricsPoller] = useState(interval(120, async () => {
    try {
      setKubeMetrics(await podMetricsApi.list({ namespace: owner.getNs() }));
    } catch (error) {
      logger.warn("loadKubeMetrics failed", error);
    }
  }));

  useEffect(() => {
    metricsPoller.start(true);

    return () => metricsPoller.stop();
  }, []);
  useEffect(() => metricsPoller.restart(true), [owner]);

  const renderCpuUsage = (id: string, usage: number) => {
    const value = usage.toFixed(3);
    const tooltip = (
      <p>CPU: {Math.ceil(usage * 100) / maxCpu}%<br/>{usage.toFixed(3)}</p>
    );

    if (!maxCpu) {
      if (parseFloat(value) === 0) return 0;

      return value;
    }

    return (
      <LineProgress
        key={id}
        max={maxCpu}
        value={usage}
        tooltip={parseFloat(value) !== 0 ? tooltip : null}
      />
    );
  };

  const renderMemoryUsage = (id: string, usage: number) => {
    const tooltip = (
      <p>Memory: {Math.ceil(usage * 100 / maxMemory)}%<br/>{bytesToUnits(usage, 3)}</p>
    );

    if (!maxMemory) return usage ? bytesToUnits(usage) : 0;

    return (
      <LineProgress
        key={id}
        max={maxMemory}
        value={usage}
        tooltip={usage != 0 ? tooltip : null}
      />
    );
  };

  const getPodKubeMetrics = (pod: Pod) => {
    const containers = pod.getContainers();
    const empty = { cpu: 0, memory: 0 };
    const metrics = kubeMetrics.find(metric => (
      metric.getName() === pod.getName()
      && metric.getNs() === pod.getNs()
    ));

    if (!metrics) return empty;

    return containers.reduce((total, container) => {
      const metric = metrics.containers.find(item => item.name == container.name);
      let cpu = "0";
      let memory = "0";

      if (metric && metric.usage) {
        cpu = metric.usage.cpu || "0";
        memory = metric.usage.memory || "0";
      }

      return {
        cpu: total.cpu + cpuUnitsToNumber(cpu),
        memory: total.memory + unitsToBytes(memory),
      };
    }, empty);
  };

  const getTableRow = (uid: string) => {
    const pod = pods.find(pod => pod.getId() == uid);
    const metrics = getPodKubeMetrics(pod);

    return (
      <TableRow
        key={pod.getId()}
        sortItem={pod}
        nowrap
        onClick={prevDefault(() => showDetails(pod.selfLink, false))}
      >
        <TableCell className="name">{pod.getName()}</TableCell>
        <TableCell className="warning"><KubeObjectStatusIcon key="icon" object={pod}/></TableCell>
        <TableCell className="namespace">{pod.getNs()}</TableCell>
        <TableCell className="ready">{pod.getRunningContainers().length}/{pod.getContainers().length}</TableCell>
        <TableCell className="cpu">{renderCpuUsage(`cpu-${pod.getId()}`, metrics.cpu)}</TableCell>
        <TableCell className="memory">{renderMemoryUsage(`memory-${pod.getId()}`, metrics.memory)}</TableCell>
        <TableCell className={cssNames("status", kebabCase(pod.getStatusMessage()))}>{pod.getStatusMessage()}</TableCell>
      </TableRow>
    );
  };

  if (!isLoaded) {
    return (
      <div className="PodDetailsList flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (!pods.length) {
    return null;
  }

  const virtual = pods.length > 20;

  return (
    <div className="PodDetailsList flex column">
      <DrawerTitle title="Pods" />
      <Table
        tableId="workloads_pod_details_list"
        items={pods}
        selectable
        scrollable={false}
        virtual={virtual}
        // 660 is the exact hight required for 20 items with the default paddings
        virtualHeight={660}
        sortable={{
          [sortBy.name]: pod => pod.getName(),
          [sortBy.namespace]: pod => pod.getNs(),
          [sortBy.cpu]: pod => getPodKubeMetrics(pod).cpu,
          [sortBy.memory]: pod => getPodKubeMetrics(pod).memory,
        }}
        sortByDefault={{ sortBy: sortBy.cpu, orderBy: "desc" }}
        sortSyncWithUrl={false}
        getTableRow={getTableRow}
        renderRow={!virtual && (pod => getTableRow(pod.getId()))}
        className="box grow"
      >
        <TableHead>
          <TableCell className="name" sortBy={sortBy.name}>Name</TableCell>
          <TableCell className="warning"/>
          <TableCell className="namespace" sortBy={sortBy.namespace}>Namespace</TableCell>
          <TableCell className="ready">Ready</TableCell>
          <TableCell className="cpu" sortBy={sortBy.cpu}>CPU</TableCell>
          <TableCell className="memory" sortBy={sortBy.memory}>Memory</TableCell>
          <TableCell className="status">Status</TableCell>
        </TableHead>
      </Table>
    </div>
  );
});

export const PodDetailsList = withInjectables<Dependencies, PodDetailsListProps>(NonInjectedPodDetailsList, {
  getProps: (di, props) => ({
    podMetricsApi: di.inject(podMetricsApiInjectable),
    ...props,
  }),
});
