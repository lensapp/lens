import "./nodes.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { t, Trans } from "@lingui/macro";
import { cssNames, IntervalManager } from "../../utils";
import { MainLayout } from "../layout/main-layout";
import { nodesStore } from "./nodes.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { KubeObjectListLayout } from "../kube-object";
import { NodesRouteParams } from "./nodes.route";
import { Node, nodesApi } from "../../api/endpoints/nodes.api";
import { NodeMenu } from "./node-menu";
import { LineProgress } from "../line-progress";
import { _i18n } from "../../i18n";
import { bytesToUnits } from "../../utils/convertMemory";
import { Tooltip, TooltipContent } from "../tooltip";
import kebabCase from "lodash/kebabCase";
import upperFirst from "lodash/upperFirst";
import { apiManager } from "../../api/api-manager";

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

interface Props extends RouteComponentProps<NodesRouteParams> {
}

@observer
export class Nodes extends React.Component<Props> {
  private metricsWatcher = new IntervalManager(30, () => nodesStore.loadUsageMetrics());

  componentDidMount(): void {
    this.metricsWatcher.start(true);
  }

  componentWillUnmount(): void {
    this.metricsWatcher.stop();
  }

  renderCpuUsage(node: Node): JSX.Element {
    const metrics = nodesStore.getLastMetricValues(node, ["cpuUsage", "cpuCapacity"]);
    if (!metrics || !metrics[1]) {
      return <LineProgress value={0}/>;
    }
    const usage = metrics[0];
    const cores = metrics[1];
    return (
      <LineProgress
        max={cores}
        value={usage}
        tooltip={_i18n._(t`CPU:`) + ` ${Math.ceil(usage * 100) / cores}\%, ` + _i18n._(t`cores:`) + ` ${cores}`}
      />
    );
  }

  renderMemoryUsage(node: Node): JSX.Element {
    const metrics = nodesStore.getLastMetricValues(node, ["memoryUsage", "memoryCapacity"]);
    if (!metrics || !metrics[1]) {
      return <LineProgress value={0}/>;
    }
    const usage = metrics[0];
    const capacity = metrics[1];
    return (
      <LineProgress
        max={capacity}
        value={usage}
        tooltip={_i18n._(t`Memory:`) + ` ${Math.ceil(usage * 100 / capacity)}%, ${bytesToUnits(usage, 3)}`}
      />
    );
  }

  renderDiskUsage(node: Node): JSX.Element {
    const metrics = nodesStore.getLastMetricValues(node, ["fsUsage", "fsSize"]);
    if (!metrics || !metrics[1]) {
      return <LineProgress value={0}/>;
    }
    const usage = metrics[0];
    const capacity = metrics[1];
    return (
      <LineProgress
        max={capacity}
        value={usage}
        tooltip={_i18n._(t`Disk:`) + ` ${Math.ceil(usage * 100 / capacity)}%, ${bytesToUnits(usage, 3)}`}
      />
    );
  }

  renderConditions(node: Node): JSX.Element[] {
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
          <Tooltip htmlFor={tooltipId} following>
            <TooltipContent tableView>
              {Object.entries(condition).map(([key, value]) =>
                <div key={key} className="flex gaps align-center">
                  <div className="name">{upperFirst(key)}</div>
                  <div className="value">{value}</div>
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </div>);
    });
  }

  render(): JSX.Element {
    return (
      <MainLayout>
        <KubeObjectListLayout
          className="Nodes"
          store={nodesStore} isClusterScoped
          isReady={nodesStore.isLoaded && nodesStore.metricsLoaded}
          dependentStores={[podsStore]}
          isSelectable={false}
          sortingCallbacks={{
            [sortBy.name]: (node: Node): string => node.getName(),
            [sortBy.cpu]: (node: Node): number[] => nodesStore.getLastMetricValues(node, ["cpuUsage"]),
            [sortBy.memory]: (node: Node): number[] => nodesStore.getLastMetricValues(node, ["memoryUsage"]),
            [sortBy.disk]: (node: Node): number[] => nodesStore.getLastMetricValues(node, ["fsUsage"]),
            [sortBy.conditions]: (node: Node): string => node.getNodeConditionText(),
            [sortBy.taints]: (node: Node): number => node.getTaints().length,
            [sortBy.roles]: (node: Node): string => node.getRoleLabels(),
            [sortBy.age]: (node: Node): string => node.metadata.creationTimestamp,
            [sortBy.version]: (node: Node): string => node.getKubeletVersion(),
          }}
          searchFilters={[
            (node: Node): string[] => node.getSearchFields(),
            (node: Node): string => node.getRoleLabels(),
            (node: Node): string => node.getKubeletVersion(),
            (node: Node): string => node.getNodeConditionText(),
          ]}
          renderHeaderTitle={<Trans>Nodes</Trans>}
          renderTableHeader={[
            { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
            { title: <Trans>CPU</Trans>, className: "cpu", sortBy: sortBy.cpu },
            { title: <Trans>Memory</Trans>, className: "memory", sortBy: sortBy.memory },
            { title: <Trans>Disk</Trans>, className: "disk", sortBy: sortBy.disk },
            { title: <Trans>Taints</Trans>, className: "taints", sortBy: sortBy.taints },
            { title: <Trans>Roles</Trans>, className: "roles", sortBy: sortBy.roles },
            { title: <Trans>Version</Trans>, className: "version", sortBy: sortBy.version },
            { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
            { title: <Trans>Conditions</Trans>, className: "conditions", sortBy: sortBy.conditions },
          ]}
          renderTableContents={(node: Node): (string | number | JSX.Element | JSX.Element[])[] => {
            const tooltipId = `node-taints-${node.getId()}`;
            return [
              node.getName(),
              this.renderCpuUsage(node),
              this.renderMemoryUsage(node),
              this.renderDiskUsage(node),
              <>
                <span id={tooltipId}>{node.getTaints().length}</span>
                <Tooltip htmlFor={tooltipId} style={{ whiteSpace: "pre-line" }}>
                  {node.getTaints().map(({ key, effect }) => `${key}: ${effect}`).join("\n")}
                </Tooltip>
              </>,
              node.getRoleLabels(),
              node.status.nodeInfo.kubeletVersion,
              node.getAge(),
              this.renderConditions(node),
            ];
          }}
          renderItemMenu={(item: Node): JSX.Element => {
            return <NodeMenu object={item}/>;
          }}
        />
      </MainLayout>
    );
  }
}

apiManager.registerViews(nodesApi, {
  Menu: NodeMenu,
});
