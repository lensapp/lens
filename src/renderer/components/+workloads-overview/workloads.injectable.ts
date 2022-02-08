/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { KubeResource } from "../../../common/rbac";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { podsStore } from "../+workloads-pods/pods.store";
import { deploymentStore } from "../+workloads-deployments/deployments.store";
import { daemonSetStore } from "../+workloads-daemonsets/daemonsets.store";
import { statefulSetStore } from "../+workloads-statefulsets/statefulset.store";
import { replicaSetStore } from "../+workloads-replicasets/replicasets.store";
import { jobStore } from "../+workloads-jobs/job.store";
import { cronJobStore } from "../+workloads-cronjobs/cronjob.store";
import isAllowedResourceInjectable from "../../../common/utils/is-allowed-resource.injectable";
import namespaceStoreInjectable from "../+namespaces/namespace-store/namespace-store.injectable";
import { workloads } from "./workloads";

const workloadsInjectable = getInjectable({
  instantiate: (di) =>
    workloads({
      isAllowedResource: di.inject(isAllowedResourceInjectable),
      namespaceStore: di.inject(namespaceStoreInjectable),

      workloadStores: new Map<KubeResource, KubeObjectStore<KubeObject>>([
        ["pods", podsStore],
        ["deployments", deploymentStore],
        ["daemonsets", daemonSetStore],
        ["statefulsets", statefulSetStore],
        ["replicasets", replicaSetStore],
        ["jobs", jobStore],
        ["cronjobs", cronJobStore],
      ]),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default workloadsInjectable;
