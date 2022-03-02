/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { WorkloadsOverviewDetailRegistry } from "../../extensions/registries";
import { OverviewStatuses } from "../components/+workloads-overview/overview-statuses";
import { WorkloadEvents } from "./workload-events";

export function initWorkloadsOverviewDetailRegistry() {
  WorkloadsOverviewDetailRegistry.getInstance()
    .add([
      {
        components: {
          Details: OverviewStatuses,
        },
      },
      {
        priority: 5,
        components: {
          Details: WorkloadEvents,
        },
      },
    ]);
}
