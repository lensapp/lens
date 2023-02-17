/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import getClusterByIdInjectable from "../../../common/cluster-store/get-by-id.injectable";
import navigateToEntitySettingsInjectable from "../../../common/front-end-routing/routes/entity-settings/navigate-to-entity-settings.injectable";
import showShortInfoNotificationInjectable from "../../../renderer/components/notifications/show-short-info.injectable";
import { internalDeepLinkingRouteInjectionToken } from "../common/internal-handler-token";

const depcratedViewClusterSettingsDeepLinkingHandlerInjectable = getInjectable({
  id: "depcrated-view-cluster-settings-deep-linking-handler",
  instantiate: (di) => {
    const getClusterById = di.inject(getClusterByIdInjectable);
    const navigateToEntitySettings = di.inject(navigateToEntitySettingsInjectable);
    const showShortInfoNotification = di.inject(showShortInfoNotificationInjectable);

    return {
      path: "/cluster/:clusterId/settings",
      handler: ({ pathname: { clusterId }}) => {
        if (!clusterId) {
          return;
        }

        const cluster = getClusterById(clusterId);

        if (cluster) {
          navigateToEntitySettings(clusterId);
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

export default depcratedViewClusterSettingsDeepLinkingHandlerInjectable;
