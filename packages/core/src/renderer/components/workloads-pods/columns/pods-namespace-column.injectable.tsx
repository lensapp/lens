/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { NamespaceSelectBadge } from "../../namespaces/namespace-select-badge";
import { podListLayoutColumnInjectionToken } from "@k8slens/list-layout";

const columnId = "namespace";

export const podsNamespaceColumnInjectable = getInjectable({
  id: "pods-namespace-column",
  instantiate: () => ({
    id: columnId,
    kind: "Pod",
    apiVersion: "v1",
    priority: 90,
    content: (pod) => <NamespaceSelectBadge key="namespace" namespace={pod.getNs()} />,
    header: { title: "Namespace", className: "namespace", sortBy: columnId, id: columnId },
    sortingCallBack: (pod) => pod.getNs(),
  }),
  injectionToken: podListLayoutColumnInjectionToken,
});

