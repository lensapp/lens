/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, RouteProps } from "../utils/buildUrl";

export const servicesRoute: RouteProps = {
  path: "/services",
};

export interface ServicesRouteParams {
}

export const servicesURL = buildURL<ServicesRouteParams>(servicesRoute.path);
