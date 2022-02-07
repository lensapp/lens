/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, RouteProps } from "../utils/buildUrl";

export const networkPoliciesRoute: RouteProps = {
  path: "/network-policies",
};

export interface NetworkPoliciesRouteParams {
}

export const networkPoliciesURL = buildURL<NetworkPoliciesRouteParams>(networkPoliciesRoute.path);
