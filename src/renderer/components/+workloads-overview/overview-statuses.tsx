import "./overview-statuses.scss"

import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { OverviewWorkloadStatus } from "./overview-workload-status";
import { Link } from "react-router-dom";
import { cronJobsURL, daemonSetsURL, deploymentsURL, jobsURL, podsURL, statefulSetsURL } from "../+workloads";
import { podsStore } from "../+workloads-pods/pods.store";
import { deploymentStore } from "../+workloads-deployments/deployments.store";
import { daemonSetStore } from "../+workloads-daemonsets/daemonsets.store";
import { statefulSetStore } from "../+workloads-statefulsets/statefulset.store";
import { jobStore } from "../+workloads-jobs/job.store";
import { cronJobStore } from "../+workloads-cronjobs/cronjob.store";
import { namespaceStore } from "../+namespaces/namespace.store";
import { PageFiltersList } from "../item-object-list/page-filters-list";
import { NamespaceSelectFilter } from "../+namespaces/namespace-select";
import { isAllowedResource } from "../../../common/rbac";

@observer
export class OverviewStatuses extends React.Component {
  render() {
    const { contextNs } = namespaceStore;
    const pods = isAllowedResource("pods") ? podsStore.getAllByNs(contextNs) : [];
    const deployments = isAllowedResource("deployments") ? deploymentStore.getAllByNs(contextNs) : [];
    const statefulSets = isAllowedResource("statefulsets") ? statefulSetStore.getAllByNs(contextNs) : [];
    const daemonSets = isAllowedResource("daemonsets") ? daemonSetStore.getAllByNs(contextNs) : [];
    const jobs = isAllowedResource("jobs") ? jobStore.getAllByNs(contextNs) : [];
    const cronJobs = isAllowedResource("cronjobs") ? cronJobStore.getAllByNs(contextNs) : [];
    return (
      <div className="OverviewStatuses">
        <div className="header flex gaps align-center">
          <h5 className="box grow"><Trans>Overview</Trans></h5>
          <NamespaceSelectFilter/>
        </div>
        <PageFiltersList/>
        <div className="workloads">
          {isAllowedResource("pods") &&
          <div className="workload">
            <div className="title"><Link to={podsURL()}><Trans>Pods</Trans> ({pods.length})</Link></div>
            <OverviewWorkloadStatus status={podsStore.getStatuses(pods)}/>
          </div>
          }
          {isAllowedResource("deployments") &&
          <div className="workload">
            <div className="title"><Link to={deploymentsURL()}><Trans>Deployments</Trans> ({deployments.length})</Link></div>
            <OverviewWorkloadStatus status={deploymentStore.getStatuses(deployments)}/>
          </div>
          }
          {isAllowedResource("statefulsets") &&
          <div className="workload">
            <div className="title"><Link to={statefulSetsURL()}><Trans>StatefulSets</Trans> ({statefulSets.length})</Link></div>
            <OverviewWorkloadStatus status={statefulSetStore.getStatuses(statefulSets)}/>
          </div>
          }
          {isAllowedResource("daemonsets") &&
          <div className="workload">
            <div className="title"><Link to={daemonSetsURL()}><Trans>DaemonSets</Trans> ({daemonSets.length})</Link></div>
            <OverviewWorkloadStatus status={daemonSetStore.getStatuses(daemonSets)}/>
          </div>
          }
          {isAllowedResource("jobs") &&
          <div className="workload">
            <div className="title"><Link to={jobsURL()}><Trans>Jobs</Trans> ({jobs.length})</Link></div>
            <OverviewWorkloadStatus status={jobStore.getStatuses(jobs)}/>
          </div>
          }
          {isAllowedResource("cronjobs") &&
          <div className="workload">
            <div className="title"><Link to={cronJobsURL()}><Trans>CronJobs</Trans> ({cronJobs.length})</Link></div>
            <OverviewWorkloadStatus status={cronJobStore.getStatuses(cronJobs)}/>
          </div>
          }
        </div>
      </div>
    )
  }
}
