/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, RouteProps } from "../utils/buildUrl";

export const addClusterRoute: RouteProps = {
  path: "/add-cluster",
};

export const addClusterURL = buildURL(addClusterRoute.path);
