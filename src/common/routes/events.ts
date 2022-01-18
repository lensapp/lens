/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteProps } from "react-router";
import { buildURL } from "../utils/buildUrl";

export const eventRoute: RouteProps = {
  path: "/events",
};

export const eventsURL = buildURL(eventRoute.path);
