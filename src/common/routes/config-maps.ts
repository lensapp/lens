/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteProps } from "react-router";
import { buildURL } from "../utils/buildUrl";

export const configMapsRoute: RouteProps = {
  path: "/configmaps",
};

export interface ConfigMapsRouteParams {
}

export const configMapsURL = buildURL<ConfigMapsRouteParams>(configMapsRoute.path);
