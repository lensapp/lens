/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteProps } from "react-router";
import { buildURL } from "../utils/buildUrl";

export interface EntitySettingsRouteParams {
  entityId: string;
}

export const entitySettingsRoute: RouteProps = {
  path: `/entity/:entityId/settings`,
};

export const entitySettingsURL = buildURL<EntitySettingsRouteParams>(entitySettingsRoute.path);
