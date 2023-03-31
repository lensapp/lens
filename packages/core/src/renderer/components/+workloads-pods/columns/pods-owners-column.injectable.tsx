/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { stopPropagation } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { Link } from "react-router-dom";
import apiManagerInjectable from "../../../../common/k8s-api/api-manager/manager.injectable";
import type { Pod } from "../../../../common/k8s-api/endpoints";
import { Badge } from "../../badge";
import getDetailsUrlInjectable from "../../kube-detail-params/get-details-url.injectable";
import type { KubeObjectListLayoutColumn } from "../../kube-object-list-layout/kube-object-list-layout-column-injection-token";
import { kubeObjectListLayoutColumnInjectionToken } from "../../kube-object-list-layout/kube-object-list-layout-column-injection-token";

export const podsOwnersColumnInjectable = getInjectable({
  id: "pods-owners-column",
  instantiate: (di): KubeObjectListLayoutColumn<Pod> => {
    const getDetailsUrl = di.inject(getDetailsUrlInjectable);
    const apiManager = di.inject(apiManagerInjectable);
    const columnId = "owners";

    return {
      id: columnId,
      kind: "Pod",
      apiVersion: "v1",
      priority: 60,
      content: (pod: Pod) => {
        return pod.getOwnerRefs().map(ref => {
          const { kind, name } = ref;
          const detailsLink = getDetailsUrl(apiManager.lookupApiLink(ref, pod));

          return (
            <Badge
              flat
              key={name}
              className="owner"
              tooltip={name}
            >
              <Link to={detailsLink} onClick={stopPropagation}>
                {kind}
              </Link>
            </Badge>
          );
        });
      },
      header: { title: "Controlled By", className: "owners", sortBy: columnId, id: columnId },
      sortingCallBack: (pod: Pod) => pod.getOwnerRefs().map(ref => ref.kind),
    };
  },
  injectionToken: kubeObjectListLayoutColumnInjectionToken,
});

