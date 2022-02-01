/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IPodContainer, Pod } from "../../../../common/k8s-api/endpoints";
import type { TabId } from "../dock/store";
import createLogsTabInjectable from "./create-logs-tab.injectable";

export interface PodLogsTabData {
  selectedPod: Pod;
  selectedContainer: IPodContainer;
}

const createPodLogsTabInjectable = getInjectable({
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

  lifecycle: lifecycleEnum.singleton,
});

export default createPodLogsTabInjectable;
