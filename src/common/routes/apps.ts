/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteProps } from "react-router";
import { buildURL } from "../utils/buildUrl";

export const appsRoute: RouteProps = {
  path: "/apps",
};

export const appsURL = buildURL(appsRoute.path);
