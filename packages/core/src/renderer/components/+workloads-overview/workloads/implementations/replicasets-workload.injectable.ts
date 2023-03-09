/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { workloadInjectionToken } from "../workload-injection-token";
import { ResourceNames } from "../../../../utils/rbac";
import navigateToReplicasetsInjectable from "../../../../../common/front-end-routing/routes/cluster/workloads/replicasets/navigate-to-replicasets.injectable";
import statusCountsForAllReplicaSetsInSelectedNamespacesInjectable from "../../../+workloads-replicasets/statuses.injectable";
import totalCountOfReplicaSetsInSelectedNamespacesInjectable from "../../../+workloads-replicasets/total-count.injectable";

const replicasetsWorkloadInjectable = getInjectable({
  id: "replicasets-workload",

  instantiate: (di) => ({
    resource: {
      apiName: "replicasets",
      group: "apps",
    },
    open: di.inject(navigateToReplicasetsInjectable),
    amountOfItems: di.inject(totalCountOfReplicaSetsInSelectedNamespacesInjectable),
    status: di.inject(statusCountsForAllReplicaSetsInSelectedNamespacesInjectable),
    title: ResourceNames.replicasets,
    orderNumber: 50,
  }),

  injectionToken: workloadInjectionToken,
});

export default replicasetsWorkloadInjectable;
