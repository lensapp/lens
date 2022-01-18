/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { orderBy } from "lodash";
import type React from "react";
import { BaseRegistry } from "./base-registry";

export interface WorkloadsOverviewDetailComponents {
  Details: React.ComponentType<{}>;
}

export interface WorkloadsOverviewDetailRegistration {
  components: WorkloadsOverviewDetailComponents;
  priority?: number;
}

type RegisteredWorkloadsOverviewDetail = Required<WorkloadsOverviewDetailRegistration>;

export class WorkloadsOverviewDetailRegistry extends BaseRegistry<WorkloadsOverviewDetailRegistration, RegisteredWorkloadsOverviewDetail> {
  getItems() {
    return orderBy(super.getItems(), "priority", "desc");
  }

  protected getRegisteredItem(item: WorkloadsOverviewDetailRegistration): RegisteredWorkloadsOverviewDetail {
    const { priority = 50, ...rest } = item;

    return { priority, ...rest };
  }
}
