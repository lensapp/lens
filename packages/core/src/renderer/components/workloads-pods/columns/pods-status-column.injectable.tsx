/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kebabCase } from "lodash";
import type { Pod } from "../../../../common/k8s-api/endpoints";
import type { KubeObjectListLayoutColumn } from "@k8slens/list-layout";
import { kubeObjectListLayoutColumnInjectionToken } from "@k8slens/list-layout";

export const podsStatusColumnInjectable = getInjectable({
  id: "pods-status-column",
  instantiate: (): KubeObjectListLayoutColumn<Pod> => {
    const columnId = "status";

    return {
      id: columnId,
      kind: "Pod",
      apiVersion: "v1",
      priority: 0,
      content: (pod: Pod) => {
        return { title: pod.getStatusMessage(), className: kebabCase(pod.getStatusMessage()) };
      },
      header: { title: "Status", className: "status", sortBy: columnId, id: columnId },
      sortingCallBack: (pod: Pod) => pod.getStatusMessage(),
      searchFilter: (pod: Pod) => pod.getStatusMessage(),
    };
  },
  injectionToken: kubeObjectListLayoutColumnInjectionToken,
});
