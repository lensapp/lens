/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { workloadInjectionToken } from "../workload-injection-token";
import { ResourceNames } from "../../../../utils/rbac";
import navigateToDeploymentsInjectable from "../../../../../common/front-end-routing/routes/cluster/workloads/deployments/navigate-to-deployments.injectable";
import totalCountOfDeploymentsInSelectedNamespacesInjectable from "../../../+workloads-deployments/total-count.injectable";
import statusCountsForAllDeploymentsInSelectedNamespacesInjectable from "../../../+workloads-deployments/statuses.injectable";

const deploymentsWorkloadInjectable = getInjectable({
  id: "deployments-workload",

  instantiate: (di) => ({
    resource: {
      apiName: "deployments",
      group: "apps",
    },
    open: di.inject(navigateToDeploymentsInjectable),
    amountOfItems: di.inject(totalCountOfDeploymentsInSelectedNamespacesInjectable),
    status: di.inject(statusCountsForAllDeploymentsInSelectedNamespacesInjectable),
    title: ResourceNames.deployments,
    orderNumber: 20,
  }),

  injectionToken: workloadInjectionToken,
});

export default deploymentsWorkloadInjectable;
