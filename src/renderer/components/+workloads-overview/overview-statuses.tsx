/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./overview-statuses.scss";

import React from "react";
import { observer } from "mobx-react";
import { OverviewWorkloadStatus } from "./overview-workload-status";
import { Link } from "react-router-dom";
import type { KubeResource } from "../../../common/rbac";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import workloadsInjectable from "./workloads.injectable";

export interface OverviewStatusesProps {}

interface Workload {
  resource: KubeResource;
  amountOfItems: number;
  href: string;
  status: Record<string, number>;
  title: string;
}

interface Dependencies {
  workloads: IComputedValue<Workload[]>;
}

const NonInjectedOverviewStatuses = observer(
  ({ workloads }: Dependencies & OverviewStatusesProps) => (
    <div className="OverviewStatuses">
      <div className="workloads">
        {workloads.get()
          .map(({ resource, title, href, status, amountOfItems }) => (
            <div className="workload" key={resource}>
              <div className="title">
                <Link to={href}>
                  {title} ({amountOfItems})
                </Link>
              </div>

              <OverviewWorkloadStatus status={status} />
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
