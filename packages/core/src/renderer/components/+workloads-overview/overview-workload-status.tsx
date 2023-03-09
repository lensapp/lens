/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./overview-workload-status.scss";

import React from "react";
import capitalize from "lodash/capitalize";
import { observer } from "mobx-react";
import type { PieChartData } from "../chart";
import { PieChart } from "../chart";
import { iter, object } from "../../utils";
import type { LensTheme } from "../../themes/lens-theme";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { PascalCase } from "type-fest";
import type { IComputedValue } from "mobx";
import activeThemeInjectable from "../../themes/active.injectable";
import type { Workload } from "./workloads/workload-injection-token";
import { foldWorkloadStatusPhase } from "../../utils/fold-workload-status-phase";

export type LowercaseOrPascalCase<T extends string> = Lowercase<T> | PascalCase<T>;

export type WorkloadStatusCounts = Partial<Record<LowercaseOrPascalCase<WorkloadStatus>, number>>;

export type WorkloadStatus = keyof typeof backgroundColourMapping;

function toLowercase<T extends string>(src: T): Lowercase<T> {
  return src.toLowerCase() as Lowercase<T>;
}

export interface OverviewWorkloadStatusProps {
  workload: Workload;
}

interface Dependencies {
  activeTheme: IComputedValue<LensTheme>;
}

const cronJobStatusBackgroundColourMapping = {
  "suspended": "colorWarning",
  "scheduled": "colorOk",
} as const;

const podStatusBackgroundColourMapping = {
  "failed": "colorError",
  "evicted": "colorError",
  "pending": "colorWarning",
  "running": "colorOk",
  "succeeded": "colorSuccess",
  "terminated": "colorTerminated",
  "unknown": "colorVague",
} as const;

const backgroundColourMapping = {
  ...podStatusBackgroundColourMapping,
  ...cronJobStatusBackgroundColourMapping,
} as const;

const NonInjectedOverviewWorkloadStatus = observer((props: OverviewWorkloadStatusProps & Dependencies) => {
  const {
    workload,
    activeTheme,
  } = props;

  const statuses = workload.status.get();
  const statusCounts = iter.chain(statuses.values())
    .map(phases => phases.reduce(foldWorkloadStatusPhase, "unknown"))
    .count();

  const statusesToBeShown = object.entries(statusCounts).filter(([, val]) => val > 0);
  const theme = activeTheme.get();

  const emptyDataSet = {
    data: [1],
    backgroundColor: [theme.colors.pieChartDefaultColor],
    label: "Empty",
  };
  const statusDataSet = {
    label: "Status",
    data: statusesToBeShown.map(([, value]) => value),
    backgroundColor: statusesToBeShown.map(([status]) => (
      theme.colors[backgroundColourMapping[toLowercase(status)]]
    )),
    tooltipLabels: statusesToBeShown.map(([status]) => (
      (percent: string) => `${capitalize(status)}: ${percent}`
    )),
  };

  const chartData: Required<PieChartData> = {
    datasets: [statusesToBeShown.length > 0 ? statusDataSet : emptyDataSet],

    labels: statusesToBeShown.map(
      ([status, value]) => `${capitalize(status)}: ${value}`,
    ),
  };

  return (
    <div className="OverviewWorkloadStatus">
      <div className="flex column align-center box grow">
        <PieChart
          data={chartData}
          options={{
            elements: {
              arc: {
                borderWidth: 0,
              },
            },
          }}
          data-testid={`workload-overview-status-chart-${workload.title.toLowerCase().replace(/\s+/, "-")}`}
        />
      </div>
    </div>
  );
});

export const OverviewWorkloadStatus = withInjectables<Dependencies, OverviewWorkloadStatusProps>(NonInjectedOverviewWorkloadStatus, {
  getProps: (di, props) => ({
    ...props,
    activeTheme: di.inject(activeThemeInjectable),
  }),
});
