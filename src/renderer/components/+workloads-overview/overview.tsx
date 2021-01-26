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
import { namespaceStore } from "../+namespaces/namespace.store";

interface Props extends RouteComponentProps<IWorkloadsOverviewRouteParams> {
}

@observer
export class WorkloadsOverview extends React.Component<Props> {
  @observable isLoading = false;
  @observable isUnmounting = false;

  async componentDidMount() {
    const stores: KubeObjectStore[] = [
      isAllowedResource("pods") && podsStore,
      isAllowedResource("deployments") && deploymentStore,
      isAllowedResource("daemonsets") && daemonSetStore,
      isAllowedResource("statefulsets") && statefulSetStore,
      isAllowedResource("replicasets") && replicaSetStore,
      isAllowedResource("jobs") && jobStore,
      isAllowedResource("cronjobs") && cronJobStore,
      isAllowedResource("events") && eventStore,
    ].filter(Boolean);

    const unsubscribeMap = new Map<KubeObjectStore, () => void>();

    const loadStores = async () => {
      this.isLoading = true;

      for (const store of stores) {
        if (this.isUnmounting) break;

        try {
          await store.loadAll();
          unsubscribeMap.get(store)?.(); // unsubscribe previous watcher
          unsubscribeMap.set(store, store.subscribe());
        } catch (error) {
          console.error("loading store error", error);
        }
      }
      this.isLoading = false;
    };

    namespaceStore.onContextChange(loadStores, {
      fireImmediately: true,
    });

    await when(() => this.isUnmounting && !this.isLoading);
    unsubscribeMap.forEach(dispose => dispose());
    unsubscribeMap.clear();
  }

  componentWillUnmount() {
    this.isUnmounting = true;
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
