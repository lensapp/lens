/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, RouteProps } from "../utils/buildUrl";

export const ingressRoute: RouteProps = {
  path: "/ingresses",
};

export interface IngressRouteParams {
}

export const ingressURL = buildURL<IngressRouteParams>(ingressRoute.path);
