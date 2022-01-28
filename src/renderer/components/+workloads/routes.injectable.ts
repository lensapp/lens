/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed, IComputedValue } from "mobx";
import type { KubeResource } from "../../../common/rbac";
import isAllowedResourceInjectable from "../../utils/allowed-resource.injectable";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { WorkloadsOverview } from "../+workloads-overview/overview";
import { Pods } from "../+pods";
import { Deployments } from "../+deployments";
import { DaemonSets } from "../+daemonsets";
import { StatefulSets } from "../+stateful-sets";
import { Jobs } from "../+jobs";
import { CronJobs } from "../+cronjobs";
import { ReplicaSets } from "../+replica-sets";
import * as routes from "../../../common/routes";

interface Dependencies {
  isAllowedResource: (resource: KubeResource) => boolean;
}

function getRoutes({ isAllowedResource }: Dependencies): IComputedValue<TabLayoutRoute[]> {
  return computed(() => {
    const tabs: TabLayoutRoute[] = [
      {
        title: "Overview",
        component: WorkloadsOverview,
        url: routes.overviewURL(),
        routePath: routes.overviewRoute.path.toString(),
      },
    ];

    if (isAllowedResource("pods")) {
      tabs.push({
        title: "Pods",
        component: Pods,
        url: routes.podsURL(),
        routePath: routes.podsRoute.path.toString(),
      });
    }

    if (isAllowedResource("deployments")) {
      tabs.push({
        title: "Deployments",
        component: Deployments,
        url: routes.deploymentsURL(),
        routePath: routes.deploymentsRoute.path.toString(),
      });
    }

    if (isAllowedResource("daemonsets")) {
      tabs.push({
        title: "DaemonSets",
        component: DaemonSets,
        url: routes.daemonSetsURL(),
        routePath: routes.daemonSetsRoute.path.toString(),
      });
    }

    if (isAllowedResource("statefulsets")) {
      tabs.push({
        title: "StatefulSets",
        component: StatefulSets,
        url: routes.statefulSetsURL(),
        routePath: routes.statefulSetsRoute.path.toString(),
      });
    }

    if (isAllowedResource("replicasets")) {
      tabs.push({
        title: "ReplicaSets",
        component: ReplicaSets,
        url: routes.replicaSetsURL(),
        routePath: routes.replicaSetsRoute.path.toString(),
      });
    }

    if (isAllowedResource("jobs")) {
      tabs.push({
        title: "Jobs",
        component: Jobs,
        url: routes.jobsURL(),
        routePath: routes.jobsRoute.path.toString(),
      });
    }

    if (isAllowedResource("cronjobs")) {
      tabs.push({
        title: "CronJobs",
        component: CronJobs,
        url: routes.cronJobsURL(),
        routePath: routes.cronJobsRoute.path.toString(),
      });
    }

    return tabs;
  });
}

const workloadRoutesInjectable = getInjectable({
  instantiate: (di) => getRoutes({
    isAllowedResource: di.inject(isAllowedResourceInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default workloadRoutesInjectable;
