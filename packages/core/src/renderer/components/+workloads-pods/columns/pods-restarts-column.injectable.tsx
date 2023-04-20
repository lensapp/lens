/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Pod } from "../../../../common/k8s-api/endpoints";
import type { KubeObjectListLayoutColumn } from "@k8slens/list-layout";
import { kubeObjectListLayoutColumnInjectionToken } from "@k8slens/list-layout";

export const podsRestartsColumnInjectable = getInjectable({
  id: "pods-restarts-column",
  instantiate: (): KubeObjectListLayoutColumn<Pod> => {
    const columnId = "restarts";

    return {
      id: columnId,
      kind: "Pod",
      apiVersion: "v1",
      priority: 70,
      content: (pod: Pod) => {
        return pod.getRestartsCount();
      },
      header: { title: "Restarts", className: "restarts", sortBy: columnId, id: columnId },
      sortingCallBack: (pod: Pod) => pod.getRestartsCount(),
    };
  },
  injectionToken: kubeObjectListLayoutColumnInjectionToken,
});

