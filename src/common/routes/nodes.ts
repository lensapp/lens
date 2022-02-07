/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, RouteProps } from "../utils/buildUrl";

export const nodesRoute: RouteProps = {
  path: "/nodes",
};

export interface NodesRouteParams {
}

export const nodesURL = buildURL<NodesRouteParams>(nodesRoute.path);
