/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, RouteProps } from "../utils/buildUrl";

export const configMapsRoute: RouteProps = {
  path: "/configmaps",
};

export interface ConfigMapsRouteParams {
}

export const configMapsURL = buildURL<ConfigMapsRouteParams>(configMapsRoute.path);
