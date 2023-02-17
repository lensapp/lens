/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import getClusterByIdInjectable from "../../../common/cluster-store/get-by-id.injectable";
import navigateToClusterViewInjectable from "../../../common/front-end-routing/routes/cluster-view/navigate-to-cluster-view.injectable";
import showShortInfoNotificationInjectable from "../../../renderer/components/notifications/show-short-info.injectable";
import { internalDeepLinkingRouteInjectionToken } from "../common/internal-handler-token";

const deprecatedViewClusterDeepLinkingHandlerInjectable = getInjectable({
  id: "deprecated-view-cluster-deep-linking-handler",
  instantiate: (di) => {
    const getClusterById = di.inject(getClusterByIdInjectable);
    const navigateToClusterView = di.inject(navigateToClusterViewInjectable);
    const showShortInfoNotification = di.inject(showShortInfoNotificationInjectable);

    return {
      path: "/cluster/:clusterId",
      handler: ({ pathname: { clusterId }}) => {
        if (!clusterId) {
          return;
        }

        const cluster = getClusterById(clusterId);

        if (cluster) {
          navigateToClusterView(clusterId);
        } else {
          showShortInfoNotification(
            <p>
              {"Unknown catalog entity "}
              <code>{clusterId}</code>
              .
            </p>,
          );
        }
      },
    };
  },
  injectionToken: internalDeepLinkingRouteInjectionToken,
});

export default deprecatedViewClusterDeepLinkingHandlerInjectable;
