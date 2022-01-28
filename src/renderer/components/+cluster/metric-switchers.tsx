/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { cssNames } from "../../utils";
import { Radio, RadioGroup } from "../radio";
import type { Node } from "../../../common/k8s-api/endpoints";
import { MetricNodeRole, MetricType } from "./overview.state";

export interface ClusterMetricSwitchersProps {
  metricsValues: [number, string][];
  metricsNodeRole: MetricNodeRole;
  setMetricsNodeRole: (val: MetricNodeRole) => void;
  metricsType: MetricType;
  setMetricsType: (val: MetricType) => void;
  masterNodes: Node[];
  workerNodes: Node[];
}

export const ClusterMetricSwitchers = observer(({
  masterNodes,
  workerNodes,
  metricsValues,
  metricsType,
  setMetricsType,
  metricsNodeRole,
  setMetricsNodeRole,
}: ClusterMetricSwitchersProps) => {
  const disableRoles = !masterNodes.length || !workerNodes.length;
  const disableMetrics = !metricsValues.length;

  return (
    <div className="flex gaps" style={{ marginBottom: "calc(var(--margin) * 2)" }}>
      <div className="box grow">
        <RadioGroup
          asButtons
          className={cssNames("RadioGroup flex gaps", { disabled: disableRoles })}
          value={metricsNodeRole}
          onChange={setMetricsNodeRole}
        >
          <Radio label="Master" value={MetricNodeRole.MASTER}/>
          <Radio label="Worker" value={MetricNodeRole.WORKER}/>
        </RadioGroup>
      </div>
      <div className="box grow" style={{ textAlign: "right" }}>
        <RadioGroup
          asButtons
          className={cssNames("RadioGroup flex gaps", { disabled: disableMetrics })}
          value={metricsType}
          onChange={setMetricsType}
        >
          <Radio label="CPU" value={MetricType.CPU}/>
          <Radio label="Memory" value={MetricType.MEMORY}/>
        </RadioGroup>
      </div>
    </div>
  );
});
