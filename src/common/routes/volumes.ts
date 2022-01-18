/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteProps } from "react-router";
import { buildURL } from "../utils/buildUrl";

export const volumesRoute: RouteProps = {
  path: "/persistent-volumes",
};

export interface VolumesRouteParams {
}

export const volumesURL = buildURL<VolumesRouteParams>(volumesRoute.path);
