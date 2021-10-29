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
import { Pods } from "../+workloads-pods";
import { Deployments } from "../+workloads-deployments";
import { DaemonSets } from "../+workloads-daemonsets";
import { StatefulSets } from "../+workloads-statefulsets";
import { Jobs } from "../+workloads-jobs";
import { CronJobs } from "../+workloads-cronjobs";
import { isAllowedResource } from "../../../common/utils/allowed-resource";
import { ReplicaSets } from "../+workloads-replicasets";
import * as routes from "../../../common/routes";

@observer
export class Workloads extends React.Component {
  static get tabRoutes(): TabLayoutRoute[] {
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
  }

  render() {
    return (
      <TabLayout className="Workloads" tabs={Workloads.tabRoutes}/>
    );
  }
}
