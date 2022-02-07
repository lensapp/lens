/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, RouteProps } from "../utils/buildUrl";

export const customResourcesRoute = "/crd";

export const customResourceDefinitionsRoute: RouteProps = {
  path: `${customResourcesRoute}/definitions/:group?/:name?`,
};

export interface CustomResourceDefinitionsRouteParams {
  group?: string;
  name?: string;
}

export const customResourceDefinitionsURL = buildURL<CustomResourceDefinitionsRouteParams>(customResourceDefinitionsRoute.path);
