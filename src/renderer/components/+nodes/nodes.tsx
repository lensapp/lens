import "./nodes.scss";
import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { cssNames, interval } from "../../utils";
import { TabLayout } from "../layout/tab-layout";
import { nodesStore } from "./nodes.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { KubeObjectListLayout } from "../kube-object";
import { INodesRouteParams } from "./nodes.route";
import { Node } from "../../api/endpoints/nodes.api";
import { LineProgress } from "../line-progress";
import { bytesToUnits } from "../../utils/convertMemory";
import { Tooltip, TooltipPosition } from "../tooltip";
import kebabCase from "lodash/kebabCase";
import upperFirst from "lodash/upperFirst";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { Badge } from "../badge/badge";

enum sortBy {
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

interface Props extends RouteComponentProps<INodesRouteParams> {
}

@observer
export class Nodes extends React.Component<Props> {
  private metricsWatcher = interval(30, () => nodesStore.loadUsageMetrics());

  componentDidMount() {
    this.metricsWatcher.start(true);
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
    const metrics = nodesStore.getLastMetricValues(node, ["memoryUsage", "memoryCapacity"]);

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
          className="Nodes"
          store={nodesStore} isClusterScoped
          isReady={nodesStore.isLoaded}
          dependentStores={[podsStore]}
          isSelectable={false}
          sortingCallbacks={{
            [sortBy.name]: (node: Node) => node.getName(),
            [sortBy.cpu]: (node: Node) => nodesStore.getLastMetricValues(node, ["cpuUsage"]),
            [sortBy.memory]: (node: Node) => nodesStore.getLastMetricValues(node, ["memoryUsage"]),
            [sortBy.disk]: (node: Node) => nodesStore.getLastMetricValues(node, ["fsUsage"]),
            [sortBy.conditions]: (node: Node) => node.getNodeConditionText(),
            [sortBy.taints]: (node: Node) => node.getTaints().length,
            [sortBy.roles]: (node: Node) => node.getRoleLabels(),
            [sortBy.age]: (node: Node) => node.metadata.creationTimestamp,
            [sortBy.version]: (node: Node) => node.getKubeletVersion(),
          }}
          searchFilters={[
            (node: Node) => node.getSearchFields(),
            (node: Node) => node.getRoleLabels(),
            (node: Node) => node.getKubeletVersion(),
            (node: Node) => node.getNodeConditionText(),
          ]}
          renderHeaderTitle="Nodes"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: sortBy.name },
            { className: "warning" },
            { title: "CPU", className: "cpu", sortBy: sortBy.cpu },
            { title: "Memory", className: "memory", sortBy: sortBy.memory },
            { title: "Disk", className: "disk", sortBy: sortBy.disk },
            { title: "Taints", className: "taints", sortBy: sortBy.taints },
            { title: "Roles", className: "roles", sortBy: sortBy.roles },
            { title: "Version", className: "version", sortBy: sortBy.version },
            { title: "Age", className: "age", sortBy: sortBy.age },
            { title: "Conditions", className: "conditions", sortBy: sortBy.conditions },
          ]}
          renderTableContents={(node: Node) => {
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
