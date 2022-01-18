/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteProps } from "react-router";
import { buildURL } from "../utils/buildUrl";

export const pdbRoute: RouteProps = {
  path: "/poddisruptionbudgets",
};

export interface PodDisruptionBudgetsRouteParams {
}

export const pdbURL = buildURL<PodDisruptionBudgetsRouteParams>(pdbRoute.path);
