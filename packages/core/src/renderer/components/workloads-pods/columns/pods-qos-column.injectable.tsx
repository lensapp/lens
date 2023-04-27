/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { podListLayoutColumnInjectionToken } from "@k8slens/list-layout";

const columnId = "qos";

export const podsQosColumnInjectable = getInjectable({
  id: "pods-qos-column",
  instantiate: () => ({
    id: columnId,
    kind: "Pod",
    apiVersion: "v1",
    priority: 40,
    content: (pod) => pod.getQosClass(),
    header: { title: "QoS", className: "qos", sortBy: columnId, id: columnId },
    sortingCallBack: (pod) => pod.getQosClass(),
  }),
  injectionToken: podListLayoutColumnInjectionToken,
});

