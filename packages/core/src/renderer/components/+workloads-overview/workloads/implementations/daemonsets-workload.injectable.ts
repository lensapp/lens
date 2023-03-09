/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { workloadInjectionToken } from "../workload-injection-token";
import { ResourceNames } from "../../../../utils/rbac";
import navigateToDaemonsetsInjectable from "../../../../../common/front-end-routing/routes/cluster/workloads/daemonsets/navigate-to-daemonsets.injectable";
import totalCountOfDaemonSetsInSelectedNamespacesInjectable from "../../../+workloads-daemonsets/total-count.injectable";
import totalStatusesForDaemonSetsInSelectedNamespacesInjectable from "../../../+workloads-daemonsets/statuses.injectable";

const daemonsetsWorkloadInjectable = getInjectable({
  id: "daemonsets-workload",

  instantiate: (di) => ({
    resource: {
      apiName: "daemonsets",
      group: "apps",
    },
    open: di.inject(navigateToDaemonsetsInjectable),
    amountOfItems: di.inject(totalCountOfDaemonSetsInSelectedNamespacesInjectable),
    status: di.inject(totalStatusesForDaemonSetsInSelectedNamespacesInjectable),
    title: ResourceNames.daemonsets,
    orderNumber: 30,
  }),

  injectionToken: workloadInjectionToken,
});

export default daemonsetsWorkloadInjectable;
