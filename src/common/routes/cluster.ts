/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, RouteProps } from "../utils/buildUrl";

export const clusterRoute: RouteProps = {
  path: "/overview",
};

export const clusterURL = buildURL(clusterRoute.path);
