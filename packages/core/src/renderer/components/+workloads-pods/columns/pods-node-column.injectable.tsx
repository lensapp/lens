/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { Link } from "react-router-dom";
import nodeApiInjectable from "../../../../common/k8s-api/endpoints/node.api.injectable";
import type { Pod } from "../../../../common/k8s-api/endpoints";
import { Badge } from "../../badge";
import getDetailsUrlInjectable from "../../kube-detail-params/get-details-url.injectable";
import type { KubeObjectListLayoutColumn } from "../../kube-object-list-layout/kube-object-list-layout-column-injection-token";
import { kubeObjectListLayoutColumnInjectionToken } from "../../kube-object-list-layout/kube-object-list-layout-column-injection-token";
import { stopPropagation } from "@k8slens/utilities";

export const podsNodeColumnInjectable = getInjectable({
  id: "pods-node-column",
  instantiate: (di): KubeObjectListLayoutColumn<Pod> => {
    const getDetailsUrl = di.inject(getDetailsUrlInjectable);
    const nodeApi = di.inject(nodeApiInjectable);
    const columnId = "node";

    return {
      id: columnId,
      kind: "Pod",
      apiVersion: "v1",
      priority: 50,
      content: (pod: Pod) => {
        return pod.getNodeName() ? (
          <Badge
            flat
            key="node"
            className="node"
            tooltip={pod.getNodeName()}
            expandable={false}
          >
            <Link
              to={getDetailsUrl(nodeApi.getUrl({ name: pod.getNodeName() }))}
              onClick={stopPropagation}>
              {pod.getNodeName()}
            </Link>
          </Badge>
        )
          : "";
      },
      header: { title: "Node", className: "node", sortBy: columnId, id: columnId },
      sortingCallBack: (pod: Pod) => pod.getNodeName(),
    };
  },
  injectionToken: kubeObjectListLayoutColumnInjectionToken,
});
