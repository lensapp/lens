import "./overview.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { OverviewStatuses } from "./overview-statuses";
import { RouteComponentProps } from "react-router";
import { IWorkloadsOverviewRouteParams } from "../+workloads";
import { eventStore } from "../+events/event.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { deploymentStore } from "../+workloads-deployments/deployments.store";
import { daemonSetStore } from "../+workloads-daemonsets/daemonsets.store";
import { statefulSetStore } from "../+workloads-statefulsets/statefulset.store";
import { replicaSetStore } from "../+workloads-replicasets/replicasets.store";
import { jobStore } from "../+workloads-jobs/job.store";
import { cronJobStore } from "../+workloads-cronjobs/cronjob.store";
import { Events } from "../+events";
import { isAllowedResource } from "../../../common/rbac";
import { kubeWatchApi } from "../../api/kube-watch-api";
import { observable } from "mobx";
import { ClusterContext } from "../context";

interface Props extends RouteComponentProps<IWorkloadsOverviewRouteParams> {
}

@observer
export class WorkloadsOverview extends React.Component<Props> {
  @observable static defaultContext: ClusterContext; // TODO: support multiple cluster contexts

  componentDidMount() {
    disposeOnUnmount(this, [
      kubeWatchApi.subscribeStores([
        podsStore, deploymentStore, daemonSetStore, statefulSetStore, replicaSetStore,
        jobStore, cronJobStore, eventStore,
      ], {
        preload: true,
        namespaces: WorkloadsOverview.defaultContext.selectedNamespaces,
      }),
    ]);
  }

  render() {
    return (
      <div className="WorkloadsOverview flex column gaps">
        <OverviewStatuses/>
        {isAllowedResource("events") && <Events compact hideFilters className="box grow"/>}
      </div>
    );
  }
}
