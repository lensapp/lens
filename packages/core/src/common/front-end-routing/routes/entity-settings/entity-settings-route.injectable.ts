/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getFrontEndRouteInjectable } from "../../front-end-route-injection-token";

export interface EntitySettingsPathParameters {
  entityId: string;
}

const entitySettingsRouteInjectable = getFrontEndRouteInjectable({
  id: "entity-settings-route",
  path: "/entity/:entityId/settings",
  clusterFrame: false,
});

export default entitySettingsRouteInjectable;
