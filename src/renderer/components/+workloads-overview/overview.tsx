/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./overview.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { eventStore } from "../+events/event.store";
import type { DeploymentStore } from "../+workloads-deployments/store";
import { statefulSetStore } from "../+workloads-statefulsets/statefulset.store";
import type { JobStore } from "../+workloads-jobs/store";
import type { CronJobStore } from "../+workloads-cronjobs/store";
import type { IComputedValue } from "mobx";
import { makeObservable, observable, reaction } from "mobx";
import { NamespaceSelectFilter } from "../+namespaces/namespace-select-filter";
import { Icon } from "../icon";
import { TooltipPosition } from "../tooltip";
import { withInjectables } from "@ogre-tools/injectable-react";
import clusterFrameContextInjectable from "../../cluster-frame-context/cluster-frame-context.injectable";
import type { ClusterFrameContext } from "../../cluster-frame-context/cluster-frame-context";
import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import detailComponentsInjectable from "./detail-components.injectable";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import type { PodStore } from "../+workloads-pods/store";
import type { DaemonSetStore } from "../+workloads-daemonsets/store";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import daemonSetStoreInjectable from "../+workloads-daemonsets/store.injectable";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import type { ReplicaSetStore } from "../+workloads-replicasets/store";
import replicaSetStoreInjectable from "../+workloads-replicasets/store.injectable";
import cronJobStoreInjectable from "../+workloads-cronjobs/store.injectable";
import deploymentStoreInjectable from "../+workloads-deployments/store.injectable";
import jobStoreInjectable from "../+workloads-jobs/store.injectable";

interface Dependencies {
  detailComponents: IComputedValue<React.ComponentType<{}>[]>;
  clusterFrameContext: ClusterFrameContext;
  subscribeStores: SubscribeStores;
  podStore: PodStore;
  daemonSetStore: DaemonSetStore;
  replicaSetStore: ReplicaSetStore;
  deploymentStore: DeploymentStore;
  jobStore: JobStore;
  cronJobStore: CronJobStore;
}

@observer
class NonInjectedWorkloadsOverview extends React.Component<Dependencies> {
  @observable loadErrors: string[] = [];

  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      this.props.subscribeStores([
        this.props.cronJobStore,
        this.props.daemonSetStore,
        this.props.deploymentStore,
        eventStore,
        this.props.jobStore,
        this.props.podStore,
        this.props.replicaSetStore,
        statefulSetStore,
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
    return (
      <SiblingsInTabLayout>
        <div className="WorkloadsOverview flex column gaps">
          <div className="header flex gaps align-center">
            <h5 className="box grow">Overview</h5>
            {this.renderLoadErrors()}
            <NamespaceSelectFilter id="overview-namespace-select-filter-input" />
          </div>

          {this.props.detailComponents.get().map((Details, index) => (
            <Details key={`workload-overview-${index}`} />
          ))}
        </div>
      </SiblingsInTabLayout>
    );
  }
}

export const WorkloadsOverview = withInjectables<Dependencies>(NonInjectedWorkloadsOverview, {
  getProps: (di) => ({
    detailComponents: di.inject(detailComponentsInjectable),
    clusterFrameContext: di.inject(clusterFrameContextInjectable),
    subscribeStores: di.inject(subscribeStoresInjectable),
    daemonSetStore: di.inject(daemonSetStoreInjectable),
    podStore: di.inject(podStoreInjectable),
    replicaSetStore: di.inject(replicaSetStoreInjectable),
    cronJobStore: di.inject(cronJobStoreInjectable),
    deploymentStore: di.inject(deploymentStoreInjectable),
    jobStore: di.inject(jobStoreInjectable),
  }),
});
