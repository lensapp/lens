/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import type React from "react";

export interface WorkloadOverviewDetail {
  orderNumber: number;
  Component: React.ElementType<{}>;
  enabled: IComputedValue<boolean>;
}

export const workloadOverviewDetailInjectionToken =
  getInjectionToken<WorkloadOverviewDetail>({
    id: "workload-overview-detail-injection-token",
  });
