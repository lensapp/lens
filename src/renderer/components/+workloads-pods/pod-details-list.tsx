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

import "./pod-details-list.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { podsStore } from "./pods.store";
import type { Pod } from "../../api/endpoints";
import { boundMethod, bytesToUnits, cssNames, interval, prevDefault } from "../../utils";
import { LineProgress } from "../line-progress";
import type { KubeObject } from "../../api/kube-object";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { Spinner } from "../spinner";
import { DrawerTitle } from "../drawer";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { showDetails } from "../kube-details";

enum sortBy {
  name = "name",
  namespace = "namespace",
  cpu = "cpu",
  memory = "memory",
}

interface Props extends OptionalProps {
  pods: Pod[];
  owner: KubeObject;
}

interface OptionalProps {
  maxCpu?: number;
  maxMemory?: number;
  showTitle?: boolean;
}

@observer
export class PodDetailsList extends React.Component<Props> {
  static defaultProps: OptionalProps = {
    showTitle: true
  };

  private metricsWatcher = interval(120, () => {
    podsStore.loadKubeMetrics(this.props.owner.getNs());
  });

  private sortingCallbacks = {
    [sortBy.name]: (pod: Pod) => pod.getName(),
    [sortBy.namespace]: (pod: Pod) => pod.getNs(),
    [sortBy.cpu]: (pod: Pod) => podsStore.getPodKubeMetrics(pod).cpu,
    [sortBy.memory]: (pod: Pod) => podsStore.getPodKubeMetrics(pod).memory,
  };

  componentDidMount() {
    this.metricsWatcher.start(true);
    disposeOnUnmount(this, [
      reaction(() => this.props.owner, () => this.metricsWatcher.restart(true))
    ]);
  }

  componentWillUnmount() {
    this.metricsWatcher.stop();
  }

  renderCpuUsage(id: string, usage: number) {
    const { maxCpu } = this.props;
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
        max={maxCpu} value={usage}
        tooltip={parseFloat(value) !== 0 ? tooltip : null}
      />
    );
  }

  renderMemoryUsage(id: string, usage: number) {
    const { maxMemory } = this.props;
    const tooltip = (
      <p>Memory: {Math.ceil(usage * 100 / maxMemory)}%<br/>{bytesToUnits(usage, 3)}</p>
    );

    if (!maxMemory) return usage ? bytesToUnits(usage) : 0;

    return (
      <LineProgress
        max={maxMemory} value={usage}
        tooltip={usage != 0 ? tooltip : null}
      />
    );
  }

  @boundMethod
  getTableRow(uid: string) {
    const { pods } = this.props;
    const pod = pods.find(pod => pod.getId() == uid);
    const metrics = podsStore.getPodKubeMetrics(pod);

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
        <TableCell className="cpu">{this.renderCpuUsage(`cpu-${pod.getId()}`, metrics.cpu)}</TableCell>
        <TableCell className="memory">{this.renderMemoryUsage(`memory-${pod.getId()}`, metrics.memory)}</TableCell>
        <TableCell className={cssNames("status", kebabCase(pod.getStatusMessage()))}>{pod.getStatusMessage()}</TableCell>
      </TableRow>
    );
  }

  render() {
    const { pods, showTitle } = this.props;
    const virtual = pods.length > 100;

    if (!pods.length && !podsStore.isLoaded) return (
      <div className="PodDetailsList flex justify-center"><Spinner/></div>
    );
    if (!pods.length) return null;

    return (
      <div className="PodDetailsList flex column">
        {showTitle && <DrawerTitle title="Pods"/>}
        <Table
          tableId="workloads_pod_details_list"
          items={pods}
          selectable
          virtual={virtual}
          scrollable={false}
          sortable={this.sortingCallbacks}
          sortByDefault={{ sortBy: sortBy.cpu, orderBy: "desc" }}
          sortSyncWithUrl={false}
          getTableRow={this.getTableRow}
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
          {
            !virtual && pods.map(pod => this.getTableRow(pod.getId()))
          }
        </Table>
      </div>
    );
  }
}
