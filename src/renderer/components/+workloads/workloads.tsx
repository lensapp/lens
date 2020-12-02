import "./workloads.scss";

import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import { WorkloadsOverview } from "../+workloads-overview/overview";
import { cronJobsRoute, cronJobsURL, daemonSetsRoute, daemonSetsURL, deploymentsRoute, deploymentsURL, jobsRoute, jobsURL, overviewRoute, overviewURL, podsRoute, podsURL, statefulSetsRoute, statefulSetsURL } from "./workloads.route";
import { namespaceStore } from "../+namespaces/namespace.store";
import { Pods } from "../+workloads-pods";
import { Deployments } from "../+workloads-deployments";
import { DaemonSets } from "../+workloads-daemonsets";
import { StatefulSets } from "../+workloads-statefulsets";
import { Jobs } from "../+workloads-jobs";
import { CronJobs } from "../+workloads-cronjobs";
import { isAllowedResource } from "../../../common/rbac";

@observer
export class Workloads extends React.Component {
  static get tabRoutes(): TabLayoutRoute[] {
    const query = namespaceStore.getContextParams();
    const routes: TabLayoutRoute[] = [
      {
        title: <Trans>Overview</Trans>,
        component: WorkloadsOverview,
        url: overviewURL({ query }),
        routePath: overviewRoute.path.toString()
      }
    ];

    if (isAllowedResource("pods")) {
      routes.push({
        title: <Trans>Pods</Trans>,
        component: Pods,
        url: podsURL({ query }),
        routePath: podsRoute.path.toString()
      });
    }

    if (isAllowedResource("deployments")) {
      routes.push({
        title: <Trans>Deployments</Trans>,
        component: Deployments,
        url: deploymentsURL({ query }),
        routePath: deploymentsRoute.path.toString(),
      });
    }

    if (isAllowedResource("daemonsets")) {
      routes.push({
        title: <Trans>DaemonSets</Trans>,
        component: DaemonSets,
        url: daemonSetsURL({ query }),
        routePath: daemonSetsRoute.path.toString(),
      });
    }

    if (isAllowedResource("statefulsets")) {
      routes.push({
        title: <Trans>StatefulSets</Trans>,
        component: StatefulSets,
        url: statefulSetsURL({ query }),
        routePath: statefulSetsRoute.path.toString(),
      });
    }

    if (isAllowedResource("jobs")) {
      routes.push({
        title: <Trans>Jobs</Trans>,
        component: Jobs,
        url: jobsURL({ query }),
        routePath: jobsRoute.path.toString(),
      });
    }

    if (isAllowedResource("cronjobs")) {
      routes.push({
        title: <Trans>CronJobs</Trans>,
        component: CronJobs,
        url: cronJobsURL({ query }),
        routePath: cronJobsRoute.path.toString(),
      });
    }

    return routes;
  }

  render() {
    return (
      <TabLayout className="Workloads" tabs={Workloads.tabRoutes}/>
    );
  }
}
