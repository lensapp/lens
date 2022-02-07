/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, RouteProps } from "../utils/buildUrl";

export const volumeClaimsRoute: RouteProps = {
  path: "/persistent-volume-claims",
};

export interface VolumeClaimsRouteParams {
}

export const volumeClaimsURL = buildURL<VolumeClaimsRouteParams>(volumeClaimsRoute.path);
