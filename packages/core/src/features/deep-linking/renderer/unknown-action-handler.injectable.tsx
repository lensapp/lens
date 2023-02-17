/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import navigateToCatalogInjectable from "../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import showShortInfoNotificationInjectable from "../../../renderer/components/notifications/show-short-info.injectable";
import { internalDeepLinkingRouteInjectionToken } from "../common/internal-handler-token";

const unknownDeepLinkingActionHandlerInjectable = getInjectable({
  id: "unknown-deep-linking-action-handler",
  instantiate: (di) => {
    const showShortInfoNotification = di.inject(showShortInfoNotificationInjectable);
    const navigateToCatalog = di.inject(navigateToCatalogInjectable);

    return {
      path: "/",
      handler: ({ tail }) => {
        if (tail) {
          showShortInfoNotification(
            <p>
              {"Unknown Action for "}
              <code>
                lens://app/
                {tail}
              </code>
              . Are you on the latest version?
            </p>,
          );
        }

        navigateToCatalog();
      },
    };
  },
  injectionToken: internalDeepLinkingRouteInjectionToken,
});

export default unknownDeepLinkingActionHandlerInjectable;
