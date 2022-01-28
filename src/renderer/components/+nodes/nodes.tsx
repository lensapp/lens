/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./nodes.scss";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { cssNames, interval } from "../../utils";
import { TabLayout } from "../layout/tab-layout";
import type { NodeStore } from "./store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { formatNodeTaint, getMetricsForAllNodes, INodeMetrics, Node } from "../../../common/k8s-api/endpoints/node.api";
import { LineProgress } from "../line-progress";
import { bytesToUnits } from "../../../common/utils/convertMemory";
import { Tooltip, TooltipPosition } from "../tooltip";
import kebabCase from "lodash/kebabCase";
import upperFirst from "lodash/upperFirst";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { Badge } from "../badge/badge";
import type { EventStore } from "../+events/store";
import type { NodesRouteParams } from "../../../common/routes";
import isEmpty from "lodash/isEmpty";
import { withInjectables } from "@ogre-tools/injectable-react";
import eventStoreInjectable from "../+events/store.injectable";
import nodeStoreInjectable from "./store.injectable";

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

export interface NodesProps extends RouteComponentProps<NodesRouteParams> {
}

type MetricsTooltipFormatter = (metrics: [number, number]) => string;

interface UsageArgs {
  node: Node;
  title: string;
  metricNames: [string, string];
  formatters: MetricsTooltipFormatter[];
}

interface Dependencies {
  eventStore: EventStore;
  nodeStore: NodeStore;
}

const NonInjectedNodes = observer(({ eventStore, nodeStore }: Dependencies & NodesProps) => {
  const [metrics, setMetrics] = useState<INodeMetrics | null>(null);
  const [metricsPoller] = useState(interval(30, async () => setMetrics(await getMetricsForAllNodes())));

  useEffect(() => {
    metricsPoller.start(true);

    return () => metricsPoller.stop();
  }, []);

  const getLastMetricValues = (node: Node, metricNames: string[]): number[] => {
    if (isEmpty(metrics)) {
      return [];
    }

    const nodeName = node.getName();

    return metricNames.map(metricName => {
      try {
        const metric = metrics[metricName];
        const result = metric.data.result.find(({ metric: { node, instance, kubernetes_node }}) => (
          nodeName === node
          || nodeName === instance
          || nodeName === kubernetes_node
        ));

        return result ? parseFloat(result.values.slice(-1)[0][1]) : 0;
      } catch (e) {
        return 0;
      }
    });
  };

  const  renderUsage =({ node, title, metricNames, formatters }: UsageArgs) => {
    const metrics = getLastMetricValues(node, metricNames);

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
  };

  const renderCpuUsage = (node: Node) => {
    return renderUsage({
      node,
      title: "CPU",
      metricNames: ["cpuUsage", "cpuCapacity"],
      formatters: [
        ([usage, capacity]) => `${(usage * 100 / capacity).toFixed(2)}%`,
        ([, cap]) => `cores: ${cap}`,
      ],
    });
  };

  const renderMemoryUsage = (node: Node) => {
    return renderUsage({
      node,
      title: "Memory",
      metricNames: ["workloadMemoryUsage", "memoryAllocatableCapacity"],
      formatters: [
        ([usage, capacity]) => `${(usage * 100 / capacity).toFixed(2)}%`,
        ([usage]) => bytesToUnits(usage, 3),
      ],
    });
  };

  const renderDiskUsage = (node: Node) => {
    return renderUsage({
      node,
      title: "Disk",
      metricNames: ["fsUsage", "fsSize"],
      formatters: [
        ([usage, capacity]) => `${(usage * 100 / capacity).toFixed(2)}%`,
        ([usage]) => bytesToUnits(usage, 3),
      ],
    });
  };

  const renderConditions = (node: Node) => {
    if (!node.status.conditions) {
      return null;
    }

    return node.getActiveConditions().map(condition => {
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
              </div>,
            )}
          </Tooltip>
        </div>
      );
    });
  };

  return (
    <TabLayout>
      <KubeObjectListLayout
        isConfigurable
        tableId="nodes"
        className="Nodes"
        store={nodeStore}
        dependentStores={[eventStore]}
        isSelectable={false}
        sortingCallbacks={{
          [columnId.name]: node => node.getName(),
          [columnId.cpu]: node => getLastMetricValues(node, ["cpuUsage"]),
          [columnId.memory]: node => getLastMetricValues(node, ["memoryUsage"]),
          [columnId.disk]: node => getLastMetricValues(node, ["fsUsage"]),
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
          const taints = node.getTaints();

          return [
            <Badge flat key="name" label={node.getName()} tooltip={node.getName()} />,
            <KubeObjectStatusIcon key="icon" object={node} />,
            renderCpuUsage(node),
            renderMemoryUsage(node),
            renderDiskUsage(node),
            <>
              <span id={tooltipId}>{taints.length}</span>
              <Tooltip targetId={tooltipId} tooltipOnParentHover={true} style={{ whiteSpace: "pre-line" }}>
                {taints.map(formatNodeTaint).join("\n")}
              </Tooltip>
            </>,
            node.getRoleLabels(),
            node.status.nodeInfo.kubeletVersion,
            node.getAge(),
            renderConditions(node),
          ];
        }}
      />
    </TabLayout>
  );
});

export const Nodes = withInjectables<Dependencies, NodesProps>(NonInjectedNodes, {
  getProps: (di, props) => ({
    eventStore: di.inject(eventStoreInjectable),
    nodeStore: di.inject(nodeStoreInjectable),
    ...props,
  }),
});
