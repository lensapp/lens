/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import type { Pod } from "../../../../common/k8s-api/endpoints";
import type { KubeObjectListLayoutColumn } from "../../kube-object-list-layout/kube-object-list-layout-column-injection-token";
import { kubeObjectListLayoutColumnInjectionToken } from "../../kube-object-list-layout/kube-object-list-layout-column-injection-token";
import { KubeObjectStatusIcon } from "../../kube-object-status-icon";

export const podsQosColumnInjectable = getInjectable({
  id: "pods-status-icon-column",
  instantiate: (): KubeObjectListLayoutColumn<Pod> => {
    const columnId = "qos";

    return {
      id: columnId,
      kind: "Pod",
      apiVersion: "v1",
      priority: 99,
      content: (pod: Pod) => {
        return <KubeObjectStatusIcon key="icon" object={pod} />;
      },
      header: { className: "warning", showWithColumn: "name" },
      sortingCallBack: (pod: Pod) => pod.getQosClass(),
    };
  },
  injectionToken: kubeObjectListLayoutColumnInjectionToken,
});

