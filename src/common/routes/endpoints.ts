/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteProps } from "react-router";
import { buildURL } from "../utils/buildUrl";

export const endpointRoute: RouteProps = {
  path: "/endpoints",
};

export interface EndpointRouteParams {
}

export const endpointURL = buildURL<EndpointRouteParams>(endpointRoute.path);
