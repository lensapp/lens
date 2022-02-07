/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteProps } from "react-router";
import { storageClassesRoute } from "./storage-classes";
import { volumeClaimsRoute, volumeClaimsURL } from "./volume-claims";
import { volumesRoute } from "./volumes";

export const storageRoute: RouteProps = {
  path: [
    volumeClaimsRoute,
    volumesRoute,
    storageClassesRoute,
  ].map(route => route.path.toString()),
};

export const storageURL = volumeClaimsURL;
