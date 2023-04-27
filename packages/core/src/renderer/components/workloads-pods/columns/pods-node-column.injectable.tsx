/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { Link } from "react-router-dom";
import nodeApiInjectable from "../../../../common/k8s-api/endpoints/node.api.injectable";
import { Badge } from "../../badge";
import getDetailsUrlInjectable from "../../kube-detail-params/get-details-url.injectable";
import { stopPropagation } from "@k8slens/utilities";
import { podListLayoutColumnInjectionToken } from "@k8slens/list-layout";

export const podsNodeColumnInjectable = getInjectable({
  id: "pods-node-column",
  instantiate: (di) => {
    const getDetailsUrl = di.inject(getDetailsUrlInjectable);
    const nodeApi = di.inject(nodeApiInjectable);
    const columnId = "node";

    return {
      id: columnId,
      kind: "Pod",
      apiVersion: "v1",
      priority: 50,
      content: (pod) => (
        pod.getNodeName()
          ? (
            <Badge
              flat
              key="node"
              className="node"
              tooltip={pod.getNodeName()}
              expandable={false}
            >
              <Link
                to={getDetailsUrl(nodeApi.formatUrlForNotListing({ name: pod.getNodeName() }))}
                onClick={stopPropagation}>
                {pod.getNodeName()}
              </Link>
            </Badge>
          )
          : ""
      ),
      header: { title: "Node", className: "node", sortBy: columnId, id: columnId },
      sortingCallBack: (pod) => pod.getNodeName(),
    };
  },
  injectionToken: podListLayoutColumnInjectionToken,
});
