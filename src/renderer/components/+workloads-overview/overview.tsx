import "./overview.scss";

import React from "react";
import { computed, observable } from "mobx";
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
import { Spinner } from "../spinner";
import { Events } from "../+events";
import { KubeObjectStore } from "../../kube-object.store";
import { isAllowedResource } from "../../../common/rbac";
import { filter } from "lodash";

interface Props extends RouteComponentProps<IWorkloadsOverviewRouteParams> {
}

@observer
export class WorkloadsOverview extends React.Component<Props> {
  @observable stores: KubeObjectStore<any>[] = [];
  unsubscribeList: (() => void)[] = [];

  @computed get isReady() {
    return this.stores.every(store => store.isLoaded);
  }

  async componentDidMount() {
    this.stores = filter([
      isAllowedResource("pods") && podsStore,
      isAllowedResource("deployments") && deploymentStore,
      isAllowedResource("daemonsets") && daemonSetStore,
      isAllowedResource("statefulsets") && statefulSetStore,
      isAllowedResource("replicasets") && replicaSetStore,
      isAllowedResource("jobs") && jobStore,
      isAllowedResource("cronjobs") && cronJobStore,
      isAllowedResource("events") && eventStore,
    ]);
    this.unsubscribeList = this.stores.map(store => store.subscribe());
  }

  componentWillUnmount() {
    this.unsubscribeList.forEach(dispose => dispose());
  }

  renderContents() {
    if (!this.isReady) {
      return <Spinner center/>;
    }

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
        {this.renderContents()}
      </div>
    );
  }
}
