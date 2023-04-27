/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { podListLayoutColumnInjectionToken } from "@k8slens/list-layout";
import { KubeObjectStatusIcon } from "../../kube-object-status-icon";

const columnId = "qos";

export const podsQosColumnInjectable = getInjectable({
  id: "pods-status-icon-column",
  instantiate: () => ({
    id: columnId,
    kind: "Pod",
    apiVersion: "v1",
    priority: 99,
    content: (pod) => <KubeObjectStatusIcon key="icon" object={pod} />,
    header: { className: "warning", showWithColumn: "name" },
    sortingCallBack: (pod) => pod.getQosClass(),
  }),
  injectionToken: podListLayoutColumnInjectionToken,
});

