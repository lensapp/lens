/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteProps } from "react-router";
import { buildURL } from "../utils/buildUrl";

export const portForwardsRoute: RouteProps = {
  path: "/port-forwards/:forwardport?",
};

export interface PortForwardsRouteParams {
  forwardport?: string;
}

export const portForwardsURL = buildURL<PortForwardsRouteParams>(portForwardsRoute.path);
