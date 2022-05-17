/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { PodContainer, Pod } from "../../../../common/k8s-api/endpoints";
import type { TabId } from "../dock/store";
import createLogsTabInjectable from "./create-logs-tab.injectable";

export interface PodLogsTabData {
  selectedPod: Pod;
  selectedContainer: PodContainer;
}

const createPodLogsTabInjectable = getInjectable({
  id: "create-pod-logs-tab",

  instantiate: (di) => {
    const createLogsTab = di.inject(createLogsTabInjectable);

    return ({ selectedPod, selectedContainer }: PodLogsTabData): TabId =>
      createLogsTab(`Pod ${selectedPod.getName()}`, {
        owner: selectedPod.getOwnerRefs()[0],
        namespace: selectedPod.getNs(),
        selectedContainer: selectedContainer.name,
        selectedPodId: selectedPod.getId(),
      });
  },
});

export default createPodLogsTabInjectable;
