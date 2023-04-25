/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getConvertedParts } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import type { Pod } from "../../../../common/k8s-api/endpoints";
import type { KubeObjectListLayoutColumn } from "@k8slens/list-layout";
import { kubeObjectListLayoutColumnInjectionToken } from "@k8slens/list-layout";
import { Tooltip } from "@k8slens/tooltip";

export const podsNameColumnInjectable = getInjectable({
  id: "pods-name-column",
  instantiate: (): KubeObjectListLayoutColumn<Pod> => {
    const columnId = "name";

    return {
      id: columnId,
      kind: "Pod",
      apiVersion: "v1",
      priority: 100,
      content: (pod: Pod) => {
        return (
          <>
            <span id={`list-pod-name-${pod.getId()}`} data-testid={`list-pod-name-${pod.getId()}`}>
              {pod.getName()}
            </span>
            <Tooltip targetId={`list-pod-name-${pod.getId()}`}>
              {pod.getName()}
            </Tooltip>
          </>
        );
      },
      header: { title: "Name", className: "name", sortBy: columnId, id: columnId },
      sortingCallBack: (pod: Pod) => getConvertedParts(pod.getName()),
      searchFilter: (pod: Pod) => pod.getSearchFields(),
    };
  },
  injectionToken: kubeObjectListLayoutColumnInjectionToken,
});

