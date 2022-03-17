/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./nodes.scss";
import React from "react";
import { observer } from "mobx-react";
import { cssNames, interval } from "../../utils";
import { TabLayout } from "../layout/tab-layout-2";
import { nodesStore } from "./nodes.store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import type { NodeMetricData, Node } from "../../../common/k8s-api/endpoints/nodes.api";
import { formatNodeTaint, getMetricsForAllNodes } from "../../../common/k8s-api/endpoints/nodes.api";
import { LineProgress } from "../line-progress";
import { bytesToUnits } from "../../../common/utils/convertMemory";
import { Tooltip, TooltipPosition } from "../tooltip";
import kebabCase from "lodash/kebabCase";
import upperFirst from "lodash/upperFirst";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { Badge } from "../badge/badge";
import { eventStore } from "../+events/event.store";
import { makeObservable, observable } from "mobx";
import isEmpty from "lodash/isEmpty";
import { KubeObjectAge } from "../kube-object/age";

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

type MetricsTooltipFormatter = (metrics: [number, number]) => string;

interface UsageArgs {
  node: Node;
  title: string;
  metricNames: [string, string];
  formatters: MetricsTooltipFormatter[];
}

@observer
export class NodesRoute extends React.Component {
  @observable.ref metrics: Partial<NodeMetricData> = {};
  private metricsWatcher = interval(30, async () => this.metrics = await getMetricsForAllNodes());

  constructor(props: any) {
    super(props);
    makeObservable(this);
  }

  async componentDidMount() {
    this.metricsWatcher.start(true);
  }

  componentWillUnmount() {
    this.metricsWatcher.stop();
  }

  getLastMetricValues(node: Node, metricNames: string[]): number[] {
    if (isEmpty(this.metrics)) {
      return [];
    }

    const nodeName = node.getName();

    return metricNames.map(metricName => {
      try {
        const metric = this.metrics[metricName];
        const result = metric?.data.result.find(({ metric: { node, instance, kubernetes_node }}) => (
          nodeName === node
          || nodeName === instance
          || nodeName === kubernetes_node
        ));

        return result ? parseFloat(result.values.slice(-1)[0][1]) : 0;
      } catch (e) {
        return 0;
      }
    });
  }

  private renderUsage({ node, title, metricNames, formatters }: UsageArgs) {
    const metrics = this.getLastMetricValues(node, metricNames);

    if (!metrics || metrics.length < 2) {
      return <LineProgress value={0}/>;
    }

    const [usage, capacity] = metrics;

    return (
      <LineProgress
        max={capacity}
        value={usage}
        tooltip={{
          preferredPositions: TooltipPosition.BOTTOM,
          children: `${title}: ${formatters.map(formatter => formatter([usage, capacity])).join(", ")}`,
        }}
      />
    );
  }

  renderCpuUsage(node: Node) {
    return this.renderUsage({
      node,
      title: "CPU",
      metricNames: ["cpuUsage", "cpuCapacity"],
      formatters: [
        ([usage, capacity]) => `${(usage * 100 / capacity).toFixed(2)}%`,
        ([, cap]) => `cores: ${cap}`,
      ],
    });
  }

  renderMemoryUsage(node: Node) {
    return this.renderUsage({
      node,
      title: "Memory",
      metricNames: ["workloadMemoryUsage", "memoryAllocatableCapacity"],
      formatters: [
        ([usage, capacity]) => `${(usage * 100 / capacity).toFixed(2)}%`,
        ([usage]) => bytesToUnits(usage, { precision: 3 }),
      ],
    });
  }

  renderDiskUsage(node: Node) {
    return this.renderUsage({
      node,
      title: "Disk",
      metricNames: ["fsUsage", "fsSize"],
      formatters: [
        ([usage, capacity]) => `${(usage * 100 / capacity).toFixed(2)}%`,
        ([usage]) => bytesToUnits(usage, { precision: 3 }),
      ],
    });
  }

  renderConditions(node: Node) {
    if (!node.status?.conditions) {
      return null;
    }

    return node.getActiveConditions().map(condition => {
      const { type } = condition;
      const tooltipId = `node-${node.getName()}-condition-${type}`;

      return (
        <div
          key={type}
          id={tooltipId}
          className={cssNames("condition", kebabCase(type))}
        >
          {type}
          <Tooltip targetId={tooltipId} formatters={{ tableView: true }}>
            {Object.entries(condition).map(([key, value]) => (
              <div key={key} className="flex gaps align-center">
                <div className="name">{upperFirst(key)}</div>
                <div className="value">{value}</div>
              </div>
            ),
            )}
          </Tooltip>
        </div>
      );
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
          dependentStores={[eventStore]}
          isSelectable={false}
          sortingCallbacks={{
            [columnId.name]: node => node.getName(),
            [columnId.cpu]: node => this.getLastMetricValues(node, ["cpuUsage"]),
            [columnId.memory]: node => this.getLastMetricValues(node, ["memoryUsage"]),
            [columnId.disk]: node => this.getLastMetricValues(node, ["fsUsage"]),
            [columnId.conditions]: node => node.getNodeConditionText(),
            [columnId.taints]: node => node.getTaints().length,
            [columnId.roles]: node => node.getRoleLabels(),
            [columnId.age]: node => -node.getCreationTimestamp(),
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
            const taints = node.getTaints();

            return [
              <Badge
                flat
                key="name"
                label={node.getName()}
                tooltip={node.getName()} 
              />,
              <KubeObjectStatusIcon key="icon" object={node} />,
              this.renderCpuUsage(node),
              this.renderMemoryUsage(node),
              this.renderDiskUsage(node),
              <>
                <span id={tooltipId}>{taints.length}</span>
                <Tooltip
                  targetId={tooltipId}
                  tooltipOnParentHover={true}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {taints.map(formatNodeTaint).join("\n")}
                </Tooltip>
              </>,
              node.getRoleLabels(),
              node.getKubeletVersion(),
              <KubeObjectAge key="age" object={node} />,
              this.renderConditions(node),
            ];
          }}
        />
      </TabLayout>
    );
  }
}
