/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { workloadInjectionToken } from "../workload-injection-token";
import { ResourceNames } from "../../../../utils/rbac";
import navigateToPodsInjectable from "../../../../../common/front-end-routing/routes/cluster/workloads/pods/navigate-to-pods.injectable";
import totalCountOfPodsInSelectedNamespacesInjectable from "../../../+workloads-pods/total-count.injectable";
import totalStatusesForPodsInSelectedNamespacesInjectable from "../../../+workloads-pods/statuses.injectable";

const podsWorkloadInjectable = getInjectable({
  id: "pods-workload",

  instantiate: (di) => ({
    resource: {
      apiName: "pods",
      group: "",
    },
    open: di.inject(navigateToPodsInjectable),
    amountOfItems: di.inject(totalCountOfPodsInSelectedNamespacesInjectable),
    status: di.inject(totalStatusesForPodsInSelectedNamespacesInjectable),
    title: ResourceNames.pods,
    orderNumber: 10,
  }),

  injectionToken: workloadInjectionToken,
});

export default podsWorkloadInjectable;
