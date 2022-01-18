/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteProps } from "react-router";
import { buildURL } from "../utils/buildUrl";

export const hpaRoute: RouteProps = {
  path: "/hpa",
};

export interface HpaRouteParams {
}

export const hpaURL = buildURL<HpaRouteParams>(hpaRoute.path);
