/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { stopPropagation } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { Link } from "react-router-dom";
import apiManagerInjectable from "../../../../common/k8s-api/api-manager/manager.injectable";
import { Badge } from "../../badge";
import getDetailsUrlInjectable from "../../kube-detail-params/get-details-url.injectable";
import { podListLayoutColumnInjectionToken } from "@k8slens/list-layout";

export const podsOwnersColumnInjectable = getInjectable({
  id: "pods-owners-column",
  instantiate: (di) => {
    const getDetailsUrl = di.inject(getDetailsUrlInjectable);
    const apiManager = di.inject(apiManagerInjectable);
    const columnId = "owners";

    return {
      id: columnId,
      kind: "Pod",
      apiVersion: "v1",
      priority: 60,
      content: (pod) => (
        pod.getOwnerRefs().map(ref => {
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
        })
      ),
      header: { title: "Controlled By", className: "owners", sortBy: columnId, id: columnId },
      sortingCallBack: (pod) => pod.getOwnerRefs().map(ref => ref.kind),
    };
  },
  injectionToken: podListLayoutColumnInjectionToken,
});

