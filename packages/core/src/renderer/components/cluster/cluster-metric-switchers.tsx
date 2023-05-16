/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { Radio, RadioGroup } from "../radio";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { SelectedMetricsType } from "./overview/selected-metrics-type.injectable";
import type { SelectedNodeRoleForMetrics } from "./overview/selected-node-role-for-metrics.injectable";
import selectedMetricsTypeInjectable from "./overview/selected-metrics-type.injectable";
import selectedNodeRoleForMetricsInjectable from "./overview/selected-node-role-for-metrics.injectable";

interface Dependencies {
  selectedMetricsType: SelectedMetricsType;
  selectedNodeRoleForMetrics: SelectedNodeRoleForMetrics;
}

const NonInjectedClusterMetricSwitchers = observer(({
  selectedMetricsType,
  selectedNodeRoleForMetrics,
}: Dependencies) => (
  <div className="flex gaps" style={{ marginBottom: "calc(var(--margin) * 2)" }}>
    <div className="box grow">
      <RadioGroup
        asButtons
        className="RadioGroup flex gaps"
        value={selectedNodeRoleForMetrics.value.get()}
        onChange={selectedNodeRoleForMetrics.set}
      >
        <Radio
          label="Master"
          value="master"
          disabled={!selectedNodeRoleForMetrics.hasMasterNodes.get()}
        />
        <Radio
          label="Worker"
          value="worker"
          disabled={!selectedNodeRoleForMetrics.hasWorkerNodes.get()}
        />
      </RadioGroup>
    </div>
    <div className="box grow" style={{ textAlign: "right" }}>
      <RadioGroup
        asButtons
        className="RadioGroup flex gaps"
        value={selectedMetricsType.value.get()}
        onChange={selectedMetricsType.set}
      >
        <Radio
          label="CPU"
          value="cpu"
          disabled={!selectedMetricsType.hasCPUMetrics.get()}
        />
        <Radio
          label="Memory"
          value="memory"
          disabled={!selectedMetricsType.hasMemoryMetrics.get()}
        />
      </RadioGroup>
    </div>
  </div>
));

export const ClusterMetricSwitchers = withInjectables<Dependencies>(NonInjectedClusterMetricSwitchers, {
  getProps: (di) => ({
    selectedMetricsType: di.inject(selectedMetricsTypeInjectable),
    selectedNodeRoleForMetrics: di.inject(selectedNodeRoleForMetricsInjectable),
  }),
});

