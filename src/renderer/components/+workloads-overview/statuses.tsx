/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./statuses.scss";

import React from "react";
import { observer } from "mobx-react";
import { OverviewWorkloadStatus } from "./workload-status";
import { Link } from "react-router-dom";
import type { KubeResource } from "../../../common/rbac";
import { ResourceNames } from "../../utils/rbac";
import { workloadURL } from "../../../common/routes";
import isAllowedResourceInjectable from "../../utils/allowed-resource.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { CronJobStore } from "../+cronjobs/store";
import type { DaemonSetStore } from "../+daemonsets/store";
import type { DeploymentStore } from "../+deployments/store";
import type { JobStore } from "../+jobs/store";
import type { PodStore } from "../+pods/store";
import type { ReplicaSetStore } from "../+replica-sets/store";
import type { StatefulSetStore } from "../+stateful-sets/store";
import cronJobStoreInjectable from "../+cronjobs/store.injectable";
import daemonSetStoreInjectable from "../+daemonsets/store.injectable";
import deploymentStoreInjectable from "../+deployments/store.injectable";
import jobStoreInjectable from "../+jobs/store.injectable";
import podStoreInjectable from "../+pods/store.injectable";
import replicaSetStoreInjectable from "../+replica-sets/store.injectable";
import statefulSetStoreInjectable from "../+stateful-sets/store.injectable";
import type { IComputedValue } from "mobx";
import selectedNamespacesInjectable from "../+namespaces/selected-namespaces.injectable";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";

export interface OverviewStatusesProps {}

interface Dependencies {
  selectedNamespaces: IComputedValue<string[]>;
  cronJobStore: CronJobStore;
  daemonSetStore: DaemonSetStore;
  deploymentStore: DeploymentStore;
  jobStore: JobStore;
  podStore: PodStore;
  replicaSetStore: ReplicaSetStore;
  statefulSetStore: StatefulSetStore;
  isAllowedResource: (resource: KubeResource) => boolean;
}

const NonInjectedOverviewStatuses = observer(({
  selectedNamespaces,
  cronJobStore,
  daemonSetStore,
  deploymentStore,
  jobStore,
  podStore,
  replicaSetStore,
  statefulSetStore,
  isAllowedResource,
}: Dependencies & OverviewStatusesProps) => {
  const renderWorkload = (resource: KubeResource, store: KubeObjectStore<KubeObject>) => {
    const items = store.getAllByNs(selectedNamespaces.get());

    return (
      <div className="workload" key={resource}>
        <div className="title">
          <Link to={workloadURL[resource]()}>{ResourceNames[resource]} ({items.length})</Link>
        </div>
        <OverviewWorkloadStatus status={store.getStatuses(items)} />
      </div>
    );
  };

  return (
    <div className="OverviewStatuses">
      <div className="workloads">
        {isAllowedResource("pods") && renderWorkload("pods", podStore)}
        {isAllowedResource("deployments") && renderWorkload("deployments", deploymentStore)}
        {isAllowedResource("statefulsets") && renderWorkload("statefulsets", statefulSetStore)}
        {isAllowedResource("daemonsets") && renderWorkload("daemonsets", daemonSetStore)}
        {isAllowedResource("replicasets") && renderWorkload("replicasets", replicaSetStore)}
        {isAllowedResource("jobs") && renderWorkload("jobs", jobStore)}
        {isAllowedResource("cronjobs") && renderWorkload("cronjobs", cronJobStore)}
      </div>
    </div>
  );
});

export const OverviewStatuses = withInjectables<Dependencies>( NonInjectedOverviewStatuses, {
  getProps: (di) => ({
    selectedNamespaces: di.inject(selectedNamespacesInjectable),
    cronJobStore: di.inject(cronJobStoreInjectable),
    daemonSetStore: di.inject(daemonSetStoreInjectable),
    deploymentStore: di.inject(deploymentStoreInjectable),
    jobStore: di.inject(jobStoreInjectable),
    podStore: di.inject(podStoreInjectable),
    replicaSetStore: di.inject(replicaSetStoreInjectable),
    statefulSetStore: di.inject(statefulSetStoreInjectable),
    isAllowedResource: di.inject(isAllowedResourceInjectable),
  }),
});
