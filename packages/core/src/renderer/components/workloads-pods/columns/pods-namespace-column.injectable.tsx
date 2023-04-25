/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { NamespaceSelectBadge } from "../../namespaces/namespace-select-badge";
import type { Pod } from "../../../../common/k8s-api/endpoints";
import type { KubeObjectListLayoutColumn } from "@k8slens/list-layout";
import { kubeObjectListLayoutColumnInjectionToken } from "@k8slens/list-layout";

export const podsNamespaceColumnInjectable = getInjectable({
  id: "pods-namespace-column",
  instantiate: (): KubeObjectListLayoutColumn<Pod> => {
    const columnId = "namespace";

    return {
      id: columnId,
      kind: "Pod",
      apiVersion: "v1",
      priority: 90,
      content: (pod: Pod) => {
        return (<NamespaceSelectBadge key="namespace" namespace={pod.getNs()} />);
      },
      header: { title: "Namespace", className: "namespace", sortBy: columnId, id: columnId },
      sortingCallBack: (pod: Pod) => pod.getNs(),
    };
  },
  injectionToken: kubeObjectListLayoutColumnInjectionToken,
});

