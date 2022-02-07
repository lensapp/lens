/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, RouteProps } from "../utils/buildUrl";

export const volumesRoute: RouteProps = {
  path: "/persistent-volumes",
};

export interface VolumesRouteParams {
}

export const volumesURL = buildURL<VolumesRouteParams>(volumesRoute.path);
