/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./overview.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { WorkloadsOverviewDetailRegistry } from "../../../extensions/registries";
import type { WorkloadsOverviewRouteParams } from "../../../common/routes";
import { makeObservable, observable, reaction } from "mobx";
import { NamespaceSelectFilter } from "../+namespaces/namespace-select-filter";
import { Icon } from "../icon";
import { TooltipPosition } from "../tooltip";
import { withInjectables } from "@ogre-tools/injectable-react";
import clusterFrameContextInjectable from "../../cluster-frame-context/cluster-frame-context.injectable";
import type { FrameContext } from "../../cluster-frame-context/cluster-frame-context";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import type { Disposer } from "../../../common/utils";
import kubeWatchApiInjectable from "../../kube-watch-api/kube-watch-api.injectable";
import type { KubeWatchSubscribeStoreOptions } from "../../kube-watch-api/kube-watch-api";
import type { CronJobStore } from "../+cronjobs/store";
import type { DaemonSetStore } from "../+daemonsets/store";
import type { DeploymentStore } from "../+deployments/store";
import type { EventStore } from "../+events/store";
import type { JobStore } from "../+jobs/store";
import type { PodStore } from "../+pods/store";
import type { ReplicaSetStore } from "../+replica-sets/store";
import type { StatefulSetStore } from "../+stateful-sets/store";
import cronJobStoreInjectable from "../+cronjobs/store.injectable";
import daemonSetStoreInjectable from "../+daemonsets/store.injectable";
import deploymentStoreInjectable from "../+deployments/store.injectable";
import eventStoreInjectable from "../+events/store.injectable";
import jobStoreInjectable from "../+jobs/store.injectable";
import podStoreInjectable from "../+pods/store.injectable";
import replicaSetStoreInjectable from "../+replica-sets/store.injectable";
import statefulSetStoreInjectable from "../+stateful-sets/store.injectable";

interface Props extends RouteComponentProps<WorkloadsOverviewRouteParams> {
}

interface Dependencies {
  clusterFrameContext: FrameContext;
  subscribeStores: (stores: KubeObjectStore<KubeObject>[], options: KubeWatchSubscribeStoreOptions) => Disposer
  cronJobStore: CronJobStore;
  daemonSetStore: DaemonSetStore;
  deploymentStore: DeploymentStore;
  eventStore: EventStore;
  jobStore: JobStore;
  podStore: PodStore;
  replicaSetStore: ReplicaSetStore;
  statefulSetStore: StatefulSetStore;
}

@observer
class NonInjectedWorkloadsOverview extends React.Component<Props & Dependencies> {
  @observable loadErrors: string[] = [];

  constructor(props: Props & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      this.props.subscribeStores([
        this.props.cronJobStore,
        this.props.daemonSetStore,
        this.props.deploymentStore,
        this.props.eventStore,
        this.props.jobStore,
        this.props.podStore,
        this.props.replicaSetStore,
        this.props.statefulSetStore,
      ], {
        onLoadFailure: error => this.loadErrors.push(String(error)),
      }),
      reaction(() => this.props.clusterFrameContext.contextNamespaces.slice(), () => {
        // clear load errors
        this.loadErrors.length = 0;
      }),
    ]);
  }

  renderLoadErrors() {
    if (this.loadErrors.length === 0) {
      return null;
    }

    return (
      <Icon
        material="warning"
        className="load-error"
        tooltip={{
          children: (
            <>
              {this.loadErrors.map((error, index) => <p key={index}>{error}</p>)}
            </>
          ),
          preferredPositions: TooltipPosition.BOTTOM,
        }}
      />
    );
  }

  render() {
    const items = WorkloadsOverviewDetailRegistry
      .getInstance()
      .getItems()
      .map(({ components: { Details }}, index) => (
        <Details key={`workload-overview-${index}`}/>
      ));

    return (
      <div className="WorkloadsOverview flex column gaps">
        <div className="header flex gaps align-center">
          <h5 className="box grow">Overview</h5>
          {this.renderLoadErrors()}
          <NamespaceSelectFilter />
        </div>
        {items}
      </div>
    );
  }
}

export const WorkloadsOverview = withInjectables<Dependencies, Props>(
  NonInjectedWorkloadsOverview,

  {
    getProps: (di, props) => ({
      clusterFrameContext: di.inject(clusterFrameContextInjectable),
      subscribeStores: di.inject(kubeWatchApiInjectable).subscribeStores,
      cronJobStore: di.inject(cronJobStoreInjectable),
      daemonSetStore: di.inject(daemonSetStoreInjectable),
      deploymentStore: di.inject(deploymentStoreInjectable),
      eventStore: di.inject(eventStoreInjectable),
      jobStore: di.inject(jobStoreInjectable),
      podStore: di.inject(podStoreInjectable),
      replicaSetStore: di.inject(replicaSetStoreInjectable),
      statefulSetStore: di.inject(statefulSetStoreInjectable),
      ...props,
    }),
  },
);
