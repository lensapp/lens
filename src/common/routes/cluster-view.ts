/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, RouteProps } from "../utils/buildUrl";

export interface ClusterViewRouteParams {
  clusterId: string;
}

export const clusterViewRoute: RouteProps = {
  exact: true,
  path: "/cluster/:clusterId",
};

export const clusterViewURL = buildURL<ClusterViewRouteParams>(clusterViewRoute.path);
