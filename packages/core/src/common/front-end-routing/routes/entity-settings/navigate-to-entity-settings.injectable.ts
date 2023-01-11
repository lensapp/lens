/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import entitySettingsRouteInjectable from "./entity-settings-route.injectable";
import { navigateToRouteInjectionToken } from "../../navigate-to-route-injection-token";

export type NavigateToEntitySettings = (entityId: string, targetTabId?: string) => void;

const navigateToEntitySettingsInjectable = getInjectable({
  id: "navigate-to-entity-settings",

  instantiate: (di): NavigateToEntitySettings => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(entitySettingsRouteInjectable);

    return (entityId, targetTabId) =>
      navigateToRoute(route, { parameters: { entityId }, fragment: targetTabId });
  },
});

export default navigateToEntitySettingsInjectable;
