import "./workloads.scss"

import * as React from "react";
import { observer } from "mobx-react";
import { Redirect, Route, Switch } from "react-router";
import { RouteComponentProps } from "react-router-dom";
import { Trans } from "@lingui/macro";
import { MainLayout, TabRoute } from "../layout/main-layout";
import { WorkloadsOverview } from "../+workloads-overview/overview";
import { cronJobsRoute, cronJobsURL, daemonSetsRoute, daemonSetsURL, deploymentsRoute, deploymentsURL, jobsRoute, jobsURL, overviewRoute, overviewURL, podsRoute, podsURL, statefulSetsRoute, statefulSetsURL, workloadsURL } from "./workloads.route";
import { namespaceStore } from "../+namespaces/namespace.store";
import { Pods } from "../+workloads-pods";
import { Deployments } from "../+workloads-deployments";
import { DaemonSets } from "../+workloads-daemonsets";
import { StatefulSets } from "../+workloads-statefulsets";
import { Jobs } from "../+workloads-jobs";
import { CronJobs } from "../+workloads-cronjobs";
import { isAllowedResource } from "../../api/rbac"

interface Props extends RouteComponentProps {
}

@observer
export class Workloads extends React.Component<Props> {
  static get tabRoutes(): TabRoute[] {
    const query = namespaceStore.getContextParams();
    const routes: TabRoute[] = [
      {
        title: <Trans>Overview</Trans>,
        component: WorkloadsOverview,
        url: overviewURL({ query }),
        path: overviewRoute.path
      }
    ]
    if (isAllowedResource("pods")) {
      routes.push({
        title: <Trans>Pods</Trans>,
        component: Pods,
        url: podsURL({ query }),
        path: podsRoute.path
      })
    }
    if (isAllowedResource("deployments")) {
      routes.push({
        title: <Trans>Deployments</Trans>,
        component: Deployments,
        url: deploymentsURL({ query }),
        path: deploymentsRoute.path,
      })
    }
    if (isAllowedResource("daemonsets")) {
      routes.push({
        title: <Trans>DaemonSets</Trans>,
        component: DaemonSets,
        url: daemonSetsURL({ query }),
        path: daemonSetsRoute.path,
      })
    }
    if (isAllowedResource("statefulsets")) {
      routes.push({
        title: <Trans>StatefulSets</Trans>,
        component: StatefulSets,
        url: statefulSetsURL({ query }),
        path: statefulSetsRoute.path,
      })
    }
    if (isAllowedResource("jobs")) {
      routes.push({
        title: <Trans>Jobs</Trans>,
        component: Jobs,
        url: jobsURL({ query }),
        path: jobsRoute.path,
      })
    }
    if (isAllowedResource("cronjobs")) {
      routes.push({
        title: <Trans>CronJobs</Trans>,
        component: CronJobs,
        url: cronJobsURL({ query }),
        path: cronJobsRoute.path,
      })
    }
    return routes;
  };

  render() {
    const tabRoutes = Workloads.tabRoutes;
    return (
      <MainLayout className="Workloads" tabs={tabRoutes}>
        <Switch>
          {tabRoutes.map((route, index) => <Route key={index} {...route}/>)}
          <Redirect to={workloadsURL({ query: namespaceStore.getContextParams() })}/>
        </Switch>
      </MainLayout>
    )
  }
}
