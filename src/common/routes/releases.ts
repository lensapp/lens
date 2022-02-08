/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteProps } from "react-router";
import { buildURL } from "../utils/buildUrl";
import { helmRoute } from "./helm";

export const releaseRoute: RouteProps = {
  path: `${helmRoute.path}/releases/:namespace?/:name?`,
};

export interface ReleaseRouteParams {
  name?: string;
  namespace?: string;
}

export const releaseURL = buildURL<ReleaseRouteParams>(releaseRoute.path);
