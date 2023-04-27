/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { KubeObjectAge } from "../../kube-object/age";
import { podListLayoutColumnInjectionToken } from "@k8slens/list-layout";

const columnId = "age";

export const podsAgeColumnInjectable = getInjectable({
  id: "pods-age-column",
  instantiate: () => ({
    id: columnId,
    kind: "Pod",
    apiVersion: "v1",
    priority: 30,
    content: (pod) => <KubeObjectAge key="age" object={pod} />,
    header: { title: "Age", className: "age", sortBy: columnId, id: columnId },
    sortingCallBack: (pod) => -pod.getCreationTimestamp(),
  }),
  injectionToken: podListLayoutColumnInjectionToken,
});
