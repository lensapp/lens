import "./overview.scss";

import React from "react";
import { observable, when } from "mobx";
import { observer } from "mobx-react";
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
import { KubeObjectStore } from "../../kube-object.store";
import { isAllowedResource } from "../../../common/rbac";

interface Props extends RouteComponentProps<IWorkloadsOverviewRouteParams> {
}

@observer
export class WorkloadsOverview extends React.Component<Props> {
  @observable isUnmounting = false;

  async componentDidMount() {
    const stores: KubeObjectStore[] = [];

    if (isAllowedResource("pods")) {
      stores.push(podsStore);
    }

    if (isAllowedResource("deployments")) {
      stores.push(deploymentStore);
    }

    if (isAllowedResource("daemonsets")) {
      stores.push(daemonSetStore);
    }

    if (isAllowedResource("statefulsets")) {
      stores.push(statefulSetStore);
    }

    if (isAllowedResource("replicasets")) {
      stores.push(replicaSetStore);
    }

    if (isAllowedResource("jobs")) {
      stores.push(jobStore);
    }

    if (isAllowedResource("cronjobs")) {
      stores.push(cronJobStore);
    }

    if (isAllowedResource("events")) {
      stores.push(eventStore);
    }

    const unsubscribeList: Array<() => void> = [];

    for (const store of stores) {
      await store.loadAll();
      unsubscribeList.push(store.subscribe());
    }

    await when(() => this.isUnmounting);
    unsubscribeList.forEach(dispose => dispose());
  }

  componentWillUnmount() {
    this.isUnmounting = true;
  }

  get contents() {
    return (
      <>
        <OverviewStatuses/>
        { isAllowedResource("events") && <Events
          compact
          hideFilters
          className="box grow"
        /> }
      </>
    );
  }

  render() {
    return (
      <div className="WorkloadsOverview flex column gaps">
        {this.contents}
      </div>
    );
  }
}
