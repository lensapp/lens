/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./overview-statuses.scss";

import React from "react";
import { observer } from "mobx-react";
import { OverviewWorkloadStatus } from "./overview-workload-status";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import workloadsInjectable from "./workloads/workloads.injectable";
import type { Workload } from "./workloads/workload-injection-token";
import { formatKubeApiResource } from "../../../common/rbac";

export interface OverviewStatusesProps {}

interface Dependencies {
  workloads: IComputedValue<Workload[]>;
}

const NonInjectedOverviewStatuses = observer(
  ({ workloads }: Dependencies & OverviewStatusesProps) => (
    <div className="OverviewStatuses">
      <div className="workloads">
        {workloads.get().map((workload) => (
          <div className="workload" key={formatKubeApiResource(workload.resource)}>
            <div className="title">
              <a onClick={workload.open}>
                {`${workload.title} (${workload.amountOfItems.get()})`}
              </a>
            </div>

            <OverviewWorkloadStatus workload={workload} />
          </div>
        ))}
      </div>
    </div>
  ),
);

export const OverviewStatuses = withInjectables<Dependencies, OverviewStatusesProps>(NonInjectedOverviewStatuses, {
  getProps: (di, props) => ({
    workloads: di.inject(workloadsInjectable),
    ...props,
  }),
});
