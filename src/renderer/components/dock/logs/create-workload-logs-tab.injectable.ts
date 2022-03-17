/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { podsStore } from "../../+workloads-pods/pods.store";
import type { DaemonSet, Deployment, Job, ReplicaSet, StatefulSet } from "../../../../common/k8s-api/endpoints";
import type { TabId } from "../dock/store";
import type { CreateLogsTabData } from "./create-logs-tab.injectable";
import createLogsTabInjectable from "./create-logs-tab.injectable";

export interface WorkloadLogsTabData {
  workload: StatefulSet | Job | Deployment | DaemonSet | ReplicaSet;
}

interface Dependencies {
  createLogsTab: (title: string, data: CreateLogsTabData) => TabId;
}

const createWorkloadLogsTab = ({ createLogsTab }: Dependencies) => ({ workload }: WorkloadLogsTabData): TabId | undefined => {
  const pods = podsStore.getPodsByOwnerId(workload.getId());

  if (pods.length === 0) {
    return undefined;
  }

  const selectedPod = pods[0];

  return createLogsTab(`${workload.kind} ${selectedPod.getName()}`, {
    selectedContainer: selectedPod.getAllContainers()[0].name,
    selectedPodId: selectedPod.getId(),
    namespace: selectedPod.getNs(),
    owner: {
      kind: workload.kind,
      name: workload.getName(),
      uid: workload.getId(),
    },
  });
};

const createWorkloadLogsTabInjectable = getInjectable({
  id: "create-workload-logs-tab",

  instantiate: (di) => createWorkloadLogsTab({
    createLogsTab: di.inject(createLogsTabInjectable),
  }),
});

export default createWorkloadLogsTabInjectable;
