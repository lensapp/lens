/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteProps } from "react-router";
import type { URLParams } from "../utils/buildUrl";
import { configMapsRoute, configMapsURL } from "./config-maps";
import { hpaRoute } from "./hpa";
import { limitRangesRoute } from "./limit-ranges";
import { pdbRoute } from "./pod-disruption-budgets";
import { resourceQuotaRoute } from "./resource-quotas";
import { secretsRoute } from "./secrets";

export const configRoute: RouteProps = {
  path: [
    configMapsRoute,
    secretsRoute,
    resourceQuotaRoute,
    limitRangesRoute,
    hpaRoute,
    pdbRoute,
  ].map(route => route.path.toString()),
};

export const configURL = (params?: URLParams) => configMapsURL(params);
