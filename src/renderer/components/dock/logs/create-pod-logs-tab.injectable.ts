/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { Pod, IPodContainer } from "../../../../common/k8s-api/endpoints";
import { bind } from "../../../utils";
import type { TabId } from "../dock/store";
import createLogsTabInjectable, { CreateLogsTabData } from "./create-logs-tab.injectable";

export interface PodLogsTabData {
  selectedPod: Pod;
  selectedContainer: IPodContainer;
}

interface Dependencies {
  createLogsTab: (title: string, data: CreateLogsTabData) => TabId;
}

function createPodLogsTab({ createLogsTab }: Dependencies, { selectedPod, selectedContainer }: PodLogsTabData): TabId {
  const podOwner = selectedPod.getOwnerRefs()[0];

  return createLogsTab(`Pod ${selectedPod.getName()}`, {
    ownerId: podOwner?.uid,
    namespace: selectedPod.getNs(),
    selectedContainer: selectedContainer.name,
    selectedPodId: selectedPod.getId(),
  });
}

const createPodLogsTabInjectable = getInjectable({
  instantiate: (di) => bind(createPodLogsTab, null, {
    createLogsTab: di.inject(createLogsTabInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default createPodLogsTabInjectable;
