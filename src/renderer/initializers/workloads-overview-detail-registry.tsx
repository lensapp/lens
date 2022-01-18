/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { isAllowedResource } from "../../common/utils/allowed-resource";
import { WorkloadsOverviewDetailRegistry } from "../../extensions/registries";
import { Events } from "../components/+events";
import { OverviewStatuses } from "../components/+workloads-overview/overview-statuses";

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
          Details: () => (
            isAllowedResource("events") && <Events compact hideFilters className="box grow" />
          ),
        },
      },
    ]);
}
