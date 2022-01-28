/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import getPodsByOwnerIdInjectable from "../../+pods/get-pods-by-owner-id.injectable";
import type { Pod } from "../../../../common/k8s-api/endpoints";
import type { WorkloadKubeObject } from "../../../../common/k8s-api/workload-kube-object";
import { bind } from "../../../utils";
import type { TabId } from "../dock/store";
import createLogsTabInjectable, { CreateLogsTabData } from "./create-tab.injectable";

export interface WorkloadLogsTabData {
  workload: WorkloadKubeObject
}

interface Dependencies {
  createLogsTab: (title: string, data: CreateLogsTabData) => TabId;
  getPodsByOwnerId: (id: string) => Pod[];
}

function createWorkloadLogsTab({ createLogsTab, getPodsByOwnerId }: Dependencies, { workload }: WorkloadLogsTabData): TabId | undefined {
  const pods = getPodsByOwnerId(workload.getId());

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
}

const createWorkloadLogsTabInjectable = getInjectable({
  instantiate: (di) => bind(createWorkloadLogsTab, null, {
    createLogsTab: di.inject(createLogsTabInjectable),
    getPodsByOwnerId: di.inject(getPodsByOwnerIdInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default createWorkloadLogsTabInjectable;
