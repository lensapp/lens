/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, RouteProps } from "../utils/buildUrl";

export const limitRangesRoute: RouteProps = {
  path: "/limitranges",
};

export interface LimitRangeRouteParams {
}

export const limitRangeURL = buildURL<LimitRangeRouteParams>(limitRangesRoute.path);
