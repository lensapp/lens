/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./overview-statuses.scss";

import React from "react";
import { observer } from "mobx-react";
import { OverviewWorkloadStatus } from "./overview-workload-status";
import { Link } from "react-router-dom";
import type { NamespaceStore } from "../+namespaces/namespace-store/namespace.store";
import type { KubeResource } from "../../../common/rbac";
import { ResourceNames } from "../../utils/rbac";
import { workloadURL } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "../+namespaces/namespace-store/namespace-store.injectable";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { deploymentStore } from "../+workloads-deployments/deployments.store";
import { daemonSetStore } from "../+workloads-daemonsets/daemonsets.store";
import { statefulSetStore } from "../+workloads-statefulsets/statefulset.store";
import { jobStore } from "../+workloads-jobs/job.store";
import { cronJobStore } from "../+workloads-cronjobs/cronjob.store";
import { replicaSetStore } from "../+workloads-replicasets/replicasets.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import type { IsAllowedResource } from "../../../common/utils/is-allowed-resource.injectable";
import isAllowedResourceInjectable from "../../../common/utils/is-allowed-resource.injectable";

const workloadStores = new Map<KubeResource, KubeObjectStore<KubeObject>>([
  ["pods", podsStore],
  ["deployments", deploymentStore],
  ["daemonsets", daemonSetStore],
  ["statefulsets", statefulSetStore],
  ["replicasets", replicaSetStore],
  ["jobs", jobStore],
  ["cronjobs", cronJobStore],
]);

export interface OverviewStatusesProps {}

interface Dependencies {
  namespaceStore: NamespaceStore;
  isAllowedResource: IsAllowedResource;
}

const NonInjectedOverviewStatuses = observer(({ namespaceStore, isAllowedResource }: Dependencies & OverviewStatusesProps) => {
  const renderWorkloads = () => {
    const workloads: React.ReactNode[] = [];

    for (const [resource, store] of workloadStores.entries()) {
      if (!isAllowedResource(resource)) {
        continue;
      }

      const items = store.getAllByNs(namespaceStore.contextNamespaces);

      workloads.push(
        <div className="workload" key={resource}>
          <div className="title">
            <Link to={workloadURL[resource]()}>{ResourceNames[resource]} ({items.length})</Link>
          </div>
          <OverviewWorkloadStatus status={store.getStatuses(items)} />
        </div>,
      );
    }

    return workloads;
  };

  return (
    <div className="OverviewStatuses">
      <div className="workloads">
        {renderWorkloads()}
      </div>
    </div>
  );
});

export const OverviewStatuses = withInjectables<Dependencies, OverviewStatusesProps>(NonInjectedOverviewStatuses, {
  getProps: (di, props) => ({
    namespaceStore: di.inject(namespaceStoreInjectable),
    isAllowedResource: di.inject(isAllowedResourceInjectable),
    ...props,
  }),
});
