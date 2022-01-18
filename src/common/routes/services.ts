/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteProps } from "react-router";
import { buildURL } from "../utils/buildUrl";

export const servicesRoute: RouteProps = {
  path: "/services",
};

export interface ServicesRouteParams {
}

export const servicesURL = buildURL<ServicesRouteParams>(servicesRoute.path);
