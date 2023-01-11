/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { Route } from "../../front-end-route-injection-token";
import { frontEndRouteInjectionToken } from "../../front-end-route-injection-token";

export interface EntitySettingsPathParameters {
  entityId: string;
}

const entitySettingsRouteInjectable = getInjectable({
  id: "entity-settings-route",

  instantiate: (): Route<EntitySettingsPathParameters> => ({
    path: "/entity/:entityId/settings",
    clusterFrame: false,
    isEnabled: computed(() => true),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

export default entitySettingsRouteInjectable;
