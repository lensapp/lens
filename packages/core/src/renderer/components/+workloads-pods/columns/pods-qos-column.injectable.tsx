/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Pod } from "../../../../common/k8s-api/endpoints";
import type { KubeObjectListLayoutColumn } from "@k8slens/list-layout";
import { kubeObjectListLayoutColumnInjectionToken } from "@k8slens/list-layout";

export const podsQosColumnInjectable = getInjectable({
  id: "pods-qos-column",
  instantiate: (): KubeObjectListLayoutColumn<Pod> => {
    const columnId = "qos";

    return {
      id: columnId,
      kind: "Pod",
      apiVersion: "v1",
      priority: 40,
      content: (pod: Pod) => {
        return pod.getQosClass();
      },
      header: { title: "QoS", className: "qos", sortBy: columnId, id: columnId },
      sortingCallBack: (pod: Pod) => pod.getQosClass(),
    };
  },
  injectionToken: kubeObjectListLayoutColumnInjectionToken,
});

