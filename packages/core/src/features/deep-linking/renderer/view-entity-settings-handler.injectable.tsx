/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import navigateToEntitySettingsInjectable from "../../../common/front-end-routing/routes/entity-settings/navigate-to-entity-settings.injectable";
import catalogEntityRegistryInjectable from "../../../renderer/api/catalog/entity/registry.injectable";
import showShortInfoNotificationInjectable from "../../../renderer/components/notifications/show-short-info.injectable";
import { internalDeepLinkingRouteInjectionToken } from "../common/internal-handler-token";

const viewEntitySettingsDeepLinkingHandlerInjectable = getInjectable({
  id: "view-entity-settings-deep-linking-handler",
  instantiate: (di) => {
    const entityRegistry = di.inject(catalogEntityRegistryInjectable);
    const navigateToEntitySettings = di.inject(navigateToEntitySettingsInjectable);
    const showShortInfoNotification = di.inject(showShortInfoNotificationInjectable);

    return {
      path: "/entity/:entityId/settings",
      handler: ({ pathname: { entityId }}) => {
        // TODO: maybe improve typing in the future
        if (!entityId) {
          return;
        }

        const entity = entityRegistry.getById(entityId);

        if (entity) {
          navigateToEntitySettings(entityId);
        } else {
          showShortInfoNotification(
            <p>
              {"Unknown catalog entity "}
              <code>{entityId}</code>
              .
            </p>,
          );
        }
      },
    };
  },
  injectionToken: internalDeepLinkingRouteInjectionToken,
});

export default viewEntitySettingsDeepLinkingHandlerInjectable;
