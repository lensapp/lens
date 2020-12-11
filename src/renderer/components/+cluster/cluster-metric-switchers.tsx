import "./cluster-metric-switchers.scss";

import React from "react";
import { Trans } from "@lingui/macro";
import { observer } from "mobx-react";
import { nodesStore } from "../+nodes/nodes.store";
import { cssNames } from "../../utils";
import { Radio, RadioGroup } from "../radio";
import { clusterOverviewStore, MetricNodeRole, MetricType } from "./cluster-overview.store";

export const ClusterMetricSwitchers = observer(() => {
  const { metricType, metricNodeRole, getMetricsValues, metrics } = clusterOverviewStore;
  const { masterNodes, workerNodes } = nodesStore;
  const metricsValues = getMetricsValues(metrics);
  const disableRoles = !masterNodes.length || !workerNodes.length;
  const disableMetrics = !metricsValues.length;

  return (
    <div className="ClusterMetricSwitchers flex gaps">
      <div className="box grow">
        <RadioGroup
          asButtons
          className={cssNames("RadioGroup flex gaps", { disabled: disableRoles })}
          value={metricNodeRole}
          onChange={(metric: MetricNodeRole) => clusterOverviewStore.metricNodeRole = metric}
        >
          <Radio label={<Trans>Master</Trans>} value={MetricNodeRole.MASTER}/>
          <Radio label={<Trans>Worker</Trans>} value={MetricNodeRole.WORKER}/>
        </RadioGroup>
      </div>
      <div className="box grow metric-switch">
        <RadioGroup
          asButtons
          className={cssNames("RadioGroup flex gaps", { disabled: disableMetrics })}
          value={metricType}
          onChange={(value: MetricType) => clusterOverviewStore.metricType = value}
        >
          <Radio label={<Trans>CPU</Trans>} value={MetricType.CPU}/>
          <Radio label={<Trans>Memory</Trans>} value={MetricType.MEMORY}/>
        </RadioGroup>
      </div>
    </div>
  );
});