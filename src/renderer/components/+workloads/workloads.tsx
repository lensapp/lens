/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./workloads.scss";

import React from "react";
import { observer } from "mobx-react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import { WorkloadsOverview } from "../+workloads-overview/overview";
import { cronJobsRoute, cronJobsURL, daemonSetsRoute, daemonSetsURL, deploymentsRoute, deploymentsURL, jobsRoute, jobsURL, overviewRoute, overviewURL, podsRoute, podsURL, replicaSetsRoute, replicaSetsURL, statefulSetsRoute, statefulSetsURL } from "./workloads.route";
import { Pods } from "../+workloads-pods";
import { Deployments } from "../+workloads-deployments";
import { DaemonSets } from "../+workloads-daemonsets";
import { StatefulSets } from "../+workloads-statefulsets";
import { Jobs } from "../+workloads-jobs";
import { CronJobs } from "../+workloads-cronjobs";
import { isAllowedResource } from "../../../common/rbac";
import { ReplicaSets } from "../+workloads-replicasets";

@observer
export class Workloads extends React.Component {
  static get tabRoutes(): TabLayoutRoute[] {
    const routes: TabLayoutRoute[] = [
      {
        title: "Overview",
        component: WorkloadsOverview,
        url: overviewURL(),
        routePath: overviewRoute.path.toString()
      }
    ];

    if (isAllowedResource("pods")) {
      routes.push({
        title: "Pods",
        component: Pods,
        url: podsURL(),
        routePath: podsRoute.path.toString()
      });
    }

    if (isAllowedResource("deployments")) {
      routes.push({
        title: "Deployments",
        component: Deployments,
        url: deploymentsURL(),
        routePath: deploymentsRoute.path.toString(),
      });
    }

    if (isAllowedResource("daemonsets")) {
      routes.push({
        title: "DaemonSets",
        component: DaemonSets,
        url: daemonSetsURL(),
        routePath: daemonSetsRoute.path.toString(),
      });
    }

    if (isAllowedResource("statefulsets")) {
      routes.push({
        title: "StatefulSets",
        component: StatefulSets,
        url: statefulSetsURL(),
        routePath: statefulSetsRoute.path.toString(),
      });
    }

    if (isAllowedResource("replicasets")) {
      routes.push({
        title: "ReplicaSets",
        component: ReplicaSets,
        url: replicaSetsURL(),
        routePath: replicaSetsRoute.path.toString(),
      });
    }

    if (isAllowedResource("jobs")) {
      routes.push({
        title: "Jobs",
        component: Jobs,
        url: jobsURL(),
        routePath: jobsRoute.path.toString(),
      });
    }

    if (isAllowedResource("cronjobs")) {
      routes.push({
        title: "CronJobs",
        component: CronJobs,
        url: cronJobsURL(),
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
