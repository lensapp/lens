/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { workloadOverviewDetailInjectionToken } from "../workload-overview-detail-injection-token";
import { OverviewStatuses } from "../../overview-statuses";
import { computed } from "mobx";

const overviewStatusesInjectable = getInjectable({
  id: "overview-statuses",

  instantiate: () => ({
    Component: OverviewStatuses,
    enabled: computed(() => true),
    orderNumber: 50,
  }),

  injectionToken: workloadOverviewDetailInjectionToken,
});

export default overviewStatusesInjectable;
