/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, RouteProps } from "../utils/buildUrl";

export const storageClassesRoute: RouteProps = {
  path: "/storage-classes",
};

export interface StorageClassesRouteParams {
}

export const storageClassesURL = buildURL<StorageClassesRouteParams>(storageClassesRoute.path);
