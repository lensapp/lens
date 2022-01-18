/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteProps } from "react-router";
import { buildURL } from "../utils/buildUrl";
import { appsRoute } from "./apps";

export const releaseRoute: RouteProps = {
  path: `${appsRoute.path}/releases/:namespace?/:name?`,
};

export interface ReleaseRouteParams {
  name?: string;
  namespace?: string;
}

export const releaseURL = buildURL<ReleaseRouteParams>(releaseRoute.path);
