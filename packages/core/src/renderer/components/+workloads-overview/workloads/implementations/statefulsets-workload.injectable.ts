/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { workloadInjectionToken } from "../workload-injection-token";
import { ResourceNames } from "../../../../utils/rbac";
import navigateToStatefulsetsInjectable from "../../../../../common/front-end-routing/routes/cluster/workloads/statefulsets/navigate-to-statefulsets.injectable";
import totalCountOfStatefulSetsInSelectedNamespacesInjectable from "../../../+workloads-statefulsets/total-count.injectable";
import totalStatusesForStatefulSetsInSelectedNamespacesInjectable from "../../../+workloads-statefulsets/statuses.injectable";

const statefulsetsWorkloadInjectable = getInjectable({
  id: "statefulsets-workload",

  instantiate: (di) => ({
    resource: {
      apiName: "statefulsets",
      group: "apps",
    },
    open: di.inject(navigateToStatefulsetsInjectable),
    amountOfItems: di.inject(totalCountOfStatefulSetsInSelectedNamespacesInjectable),
    status: di.inject(totalStatusesForStatefulSetsInSelectedNamespacesInjectable),
    title: ResourceNames.statefulsets,
    orderNumber: 40,
  }),

  injectionToken: workloadInjectionToken,
});

export default statefulsetsWorkloadInjectable;
