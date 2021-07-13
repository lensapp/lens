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

import "./nodes.scss";
import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { cssNames, interval } from "../../utils";
import { TabLayout } from "../layout/tab-layout";
import { nodesStore } from "./nodes.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { KubeObjectListLayout } from "../kube-object";
import type { Node } from "../../api/endpoints/nodes.api";
import { LineProgress } from "../line-progress";
import { bytesToUnits } from "../../utils/convertMemory";
import { Tooltip, TooltipPosition } from "../tooltip";
import kebabCase from "lodash/kebabCase";
import upperFirst from "lodash/upperFirst";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { Badge } from "../badge/badge";
import { kubeWatchApi } from "../../api/kube-watch-api";
import { eventStore } from "../+events/event.store";
import type { NodesRouteParams } from "../../../common/routes";

enum columnId {
  name = "name",
  cpu = "cpu",
  memory = "memory",
  disk = "disk",
  conditions = "condition",
  taints = "taints",
  roles = "roles",
  age = "age",
  version = "version",
  status = "status",
}

interface Props extends RouteComponentProps<NodesRouteParams> {
}

@observer
export class Nodes extends React.Component<Props> {
  private metricsWatcher = interval(30, () => nodesStore.loadUsageMetrics());

  componentDidMount() {
    this.metricsWatcher.start(true);
    disposeOnUnmount(this, [
      kubeWatchApi.subscribeStores([nodesStore, podsStore, eventStore], {
        preload: true,
      })
    ]);
  }

  componentWillUnmount() {
    this.metricsWatcher.stop();
  }

  renderCpuUsage(node: Node) {
    const metrics = nodesStore.getLastMetricValues(node, ["cpuUsage", "cpuCapacity"]);

    if (!metrics || !metrics[1]) return <LineProgress value={0}/>;
    const usage = metrics[0];
    const cores = metrics[1];
    const cpuUsagePercent = Math.ceil(usage * 100) / cores;
    const cpuUsagePercentLabel: String = cpuUsagePercent % 1 === 0
      ? cpuUsagePercent.toString()
      : cpuUsagePercent.toFixed(2);

    return (
      <LineProgress
        max={cores}
        value={usage}
        tooltip={{
          preferredPositions: TooltipPosition.BOTTOM,
          children: `CPU: ${cpuUsagePercentLabel}\%, cores: ${cores}`
        }}
      />
    );
  }

  renderMemoryUsage(node: Node) {
    const metrics = nodesStore.getLastMetricValues(node, ["workloadMemoryUsage", "memoryAllocatableCapacity"]);

    if (!metrics || !metrics[1]) return <LineProgress value={0}/>;
    const usage = metrics[0];
    const capacity = metrics[1];

    return (
      <LineProgress
        max={capacity}
        value={usage}
        tooltip={{
          preferredPositions: TooltipPosition.BOTTOM,
          children: `Memory: ${Math.ceil(usage * 100 / capacity)}%, ${bytesToUnits(usage, 3)}`
        }}
      />
    );
  }

  renderDiskUsage(node: Node): any {
    const metrics = nodesStore.getLastMetricValues(node, ["fsUsage", "fsSize"]);

    if (!metrics || !metrics[1]) return <LineProgress value={0}/>;
    const usage = metrics[0];
    const capacity = metrics[1];

    return (
      <LineProgress
        max={capacity}
        value={usage}
        tooltip={{
          preferredPositions: TooltipPosition.BOTTOM,
          children: `Disk: ${Math.ceil(usage * 100 / capacity)}%, ${bytesToUnits(usage, 3)}`
        }}
      />
    );
  }

  renderConditions(node: Node) {
    if (!node.status.conditions) {
      return null;
    }
    const conditions = node.getActiveConditions();

    return conditions.map(condition => {
      const { type } = condition;
      const tooltipId = `node-${node.getName()}-condition-${type}`;

      return (
        <div key={type} id={tooltipId} className={cssNames("condition", kebabCase(type))}>
          {type}
          <Tooltip targetId={tooltipId} formatters={{ tableView: true }}>
            {Object.entries(condition).map(([key, value]) =>
              <div key={key} className="flex gaps align-center">
                <div className="name">{upperFirst(key)}</div>
                <div className="value">{value}</div>
              </div>
            )}
          </Tooltip>
        </div>);
    });
  }

  render() {
    return (
      <TabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="nodes"
          className="Nodes"
          store={nodesStore}
          isReady={nodesStore.isLoaded}
          dependentStores={[podsStore]}
          isSelectable={false}
          sortingCallbacks={{
            [columnId.name]: node => node.getName(),
            [columnId.cpu]: node => nodesStore.getLastMetricValues(node, ["cpuUsage"]),
            [columnId.memory]: node => nodesStore.getLastMetricValues(node, ["memoryUsage"]),
            [columnId.disk]: node => nodesStore.getLastMetricValues(node, ["fsUsage"]),
            [columnId.conditions]: node => node.getNodeConditionText(),
            [columnId.taints]: node => node.getTaints().length,
            [columnId.roles]: node => node.getRoleLabels(),
            [columnId.age]: node => node.getTimeDiffFromNow(),
            [columnId.version]: node => node.getKubeletVersion(),
          }}
          searchFilters={[
            node => node.getSearchFields(),
            node => node.getRoleLabels(),
            node => node.getKubeletVersion(),
            node => node.getNodeConditionText(),
          ]}
          renderHeaderTitle="Nodes"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "CPU", className: "cpu", sortBy: columnId.cpu, id: columnId.cpu },
            { title: "Memory", className: "memory", sortBy: columnId.memory, id: columnId.memory },
            { title: "Disk", className: "disk", sortBy: columnId.disk, id: columnId.disk },
            { title: "Taints", className: "taints", sortBy: columnId.taints, id: columnId.taints },
            { title: "Roles", className: "roles", sortBy: columnId.roles, id: columnId.roles },
            { title: "Version", className: "version", sortBy: columnId.version, id: columnId.version },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
            { title: "Conditions", className: "conditions", sortBy: columnId.conditions, id: columnId.conditions },
          ]}
          renderTableContents={node => {
            const tooltipId = `node-taints-${node.getId()}`;

            return [
              <Badge flat key="name" label={node.getName()} tooltip={node.getName()} />,
              <KubeObjectStatusIcon key="icon" object={node} />,
              this.renderCpuUsage(node),
              this.renderMemoryUsage(node),
              this.renderDiskUsage(node),
              <>
                <span id={tooltipId}>{node.getTaints().length}</span>
                <Tooltip targetId={tooltipId} style={{ whiteSpace: "pre-line" }}>
                  {node.getTaints().map(({ key, effect }) => `${key}: ${effect}`).join("\n")}
                </Tooltip>
              </>,
              node.getRoleLabels(),
              node.status.nodeInfo.kubeletVersion,
              node.getAge(),
              this.renderConditions(node),
            ];
          }}
        />
      </TabLayout>
    );
  }
}
