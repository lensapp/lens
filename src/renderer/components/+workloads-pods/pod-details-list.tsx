/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./pod-details-list.module.scss";

import { withInjectables } from "@ogre-tools/injectable-react";
import kebabCase from "lodash/kebabCase";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import type { Pod } from "../../../common/k8s-api/endpoints";
import { bytesToUnits, cssNames, interval, prevDefault } from "../../utils";
import { DrawerTitle } from "../drawer";
import { showDetails } from "../kube-detail-params";
import getDetailsUrlInjectable, { type GetDetailsUrl } from "../kube-detail-params/get-details-url.injectable";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { LineProgress } from "../line-progress";
import { Spinner } from "../spinner";
import { Table, TableCell, TableHead, TableRow } from "../table";
import type { PodStore } from "./store";
import podStoreInjectable from "./store.injectable";
import { Tooltip, TooltipPosition } from "../tooltip";

enum sortBy {
  name = "name",
  node = "node",
  namespace = "namespace",
  cpu = "cpu",
  memory = "memory",
}

export interface PodDetailsListProps {
  pods: Pod[];
  maxCpu?: number;
  maxMemory?: number;
}

interface Dependencies {
  getDetailsUrl: GetDetailsUrl;
  podStore: PodStore;
}

@observer
export class NonInjectedPodDetailsList extends React.Component<PodDetailsListProps & Dependencies> {
  private metricsWatcher = interval(120, () => {
    this.props.podStore.loadKubeMetrics(this.props.pods[0]?.getNs());
  });

  componentDidMount() {
    this.metricsWatcher.start(true);
    disposeOnUnmount(this, [
      reaction(() => this.props.pods[0]?.getNs(), () => this.metricsWatcher.restart(true)),
    ]);
  }

  componentWillUnmount() {
    this.metricsWatcher.stop();
  }

  renderCpuUsage(id: string, usage: number) {
    const { maxCpu } = this.props;
    const value = usage.toFixed(3);

    if (!maxCpu) {
      if (parseFloat(value) === 0) return 0;

      return value;
    }

    const tooltip = (
      <p>
        {`CPU: ${Math.ceil(usage * 100 / maxCpu)}%`}
        <br/>
        {usage.toFixed(3)}
      </p>
    );

    return (
      <LineProgress
        max={maxCpu}
        value={usage}
        tooltip={parseFloat(value) !== 0 ? tooltip : null}
      />
    );
  }

  renderMemoryUsage(id: string, usage: number) {
    const { maxMemory } = this.props;

    if (!maxMemory) return usage ? bytesToUnits(usage) : 0;

    const tooltip = (
      <p>
        {`Memory: ${Math.ceil(usage * 100 / maxMemory)}%`}
        <br/>
        {bytesToUnits(usage, { precision: 3 })}
      </p>
    );

    return (
      <LineProgress
        max={maxMemory}
        value={usage}
        tooltip={usage != 0 ? tooltip : null}
      />
    );
  }

  getTableRow(uid: string) {
    const { pods } = this.props;
    const pod = pods.find(pod => pod.getId() == uid);

    if (!pod) {
      return;
    }

    const metrics = this.props.podStore.getPodKubeMetrics(pod);

    return (
      <TableRow
        key={pod.getId()}
        sortItem={pod}
        nowrap
        onClick={prevDefault(() => showDetails(pod.selfLink, false))}
      >
        <TableCell className={styles.name}>
          <span id={`pod-list-pod-item-${pod.getId()}`}>{pod.getName()}</span>
          <Tooltip
            targetId={`pod-list-pod-item-${pod.getId()}`}
            preferredPositions={[TooltipPosition.TOP, TooltipPosition.TOP_LEFT]}
          >
            {pod.getName()}
          </Tooltip>
        </TableCell>
        <TableCell className={styles.warning}><KubeObjectStatusIcon key="icon" object={pod}/></TableCell>
        <TableCell className={styles.node}>{pod.getNodeName()}</TableCell>
        <TableCell className={styles.namespace}>
          <span id={`pod-list-pod-namespace-${pod.getId()}`}>{pod.getNs()}</span>
          <Tooltip
            targetId={`pod-list-pod-namespace-${pod.getId()}`}
            preferredPositions={[TooltipPosition.TOP, TooltipPosition.TOP_LEFT]}
          >
            {pod.getNs()}
          </Tooltip>
        </TableCell>
        <TableCell>
          {`${pod.getRunningContainers().length} / ${pod.getContainers().length}`}
        </TableCell>
        <TableCell className={styles.cpu}>{this.renderCpuUsage(`cpu-${pod.getId()}`, metrics.cpu)}</TableCell>
        <TableCell className={styles.memory}>{this.renderMemoryUsage(`memory-${pod.getId()}`, metrics.memory)}</TableCell>
        <TableCell className={cssNames(styles.status, kebabCase(pod.getStatusMessage()))}>{pod.getStatusMessage()}</TableCell>
      </TableRow>
    );
  }

  render() {
    const { pods, podStore } = this.props;

    if (!podStore.isLoaded) {
      return (
        <div className="PodDetailsList flex justify-center">
          <Spinner />
        </div>
      );
    }

    if (!pods.length) {
      return (
        <div>
          No items found
        </div>
      );
    }

    const virtual = pods.length > 20;

    return (
      <div className={styles.PodDetailsList}>
        <DrawerTitle>Pods</DrawerTitle>
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
            [sortBy.node]: pod => pod.getNodeName(),
            [sortBy.namespace]: pod => pod.getNs(),
            [sortBy.cpu]: pod => podStore.getPodKubeMetrics(pod).cpu,
            [sortBy.memory]: pod => podStore.getPodKubeMetrics(pod).memory,
          }}
          sortByDefault={{ sortBy: sortBy.cpu, orderBy: "desc" }}
          sortSyncWithUrl={false}
          getTableRow={this.getTableRow}
          renderRow={(
            virtual
              ? undefined
              : (pod => this.getTableRow(pod.getId()))
          )}
          className={styles.table}
        >
          <TableHead>
            <TableCell className={styles.name} sortBy={sortBy.name}>Name</TableCell>
            <TableCell className={styles.warning}/>
            <TableCell className={styles.node} sortBy={sortBy.node}>Node</TableCell>
            <TableCell className={styles.namespace} sortBy={sortBy.namespace}>Namespace</TableCell>
            <TableCell>Ready</TableCell>
            <TableCell className={styles.cpu} sortBy={sortBy.cpu}>CPU</TableCell>
            <TableCell className={styles.memory} sortBy={sortBy.memory}>Memory</TableCell>
            <TableCell className={styles.status}>Status</TableCell>
          </TableHead>
        </Table>
      </div>
    );
  }
}

export const PodDetailsList = withInjectables<Dependencies, PodDetailsListProps>(NonInjectedPodDetailsList, {
  getProps: (di, props) => ({
    ...props,
    getDetailsUrl: di.inject(getDetailsUrlInjectable),
    podStore: di.inject(podStoreInjectable),
  }),
});