/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import type { Pod } from "../../../../common/k8s-api/endpoints";
import type { KubeObjectListLayoutColumn } from "../../kube-object-list-layout/kube-object-list-layout-column-injection-token";
import { kubeObjectListLayoutColumnInjectionToken } from "../../kube-object-list-layout/kube-object-list-layout-column-injection-token";
import { KubeObjectAge } from "../../kube-object/age";

export const podsAgeColumnInjectable = getInjectable({
  id: "pods-age-column",
  instantiate: (): KubeObjectListLayoutColumn<Pod> => {
    const columnId = "age";

    return {
      id: columnId,
      kind: "Pod",
      apiVersion: "v1",
      priority: 30,
      content: (pod: Pod) => {
        return <KubeObjectAge key="age" object={pod} />;
      },
      header: { title: "Age", className: "age", sortBy: columnId, id: columnId },
      sortingCallBack: (pod: Pod) => -pod.getCreationTimestamp(),
    };
  },
  injectionToken: kubeObjectListLayoutColumnInjectionToken,
});
