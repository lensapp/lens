/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteProps as RouterProps } from "react-router";
import type { URLParams } from "../utils/buildUrl";
import { configMapsRoute, configMapsURL } from "./config-maps";
import { hpaRoute } from "./hpa";
import { limitRangesRoute } from "./limit-ranges";
import { pdbRoute } from "./pod-disruption-budgets";
import { resourceQuotaRoute } from "./resource-quotas";
import { secretsRoute } from "./secrets";

export const configRoute: RouterProps = {
  path: [
    configMapsRoute.path,
    secretsRoute.path,
    resourceQuotaRoute.path,
    limitRangesRoute.path,
    hpaRoute.path,
    pdbRoute.path,
  ],
};

export const configURL = (params?: URLParams) => configMapsURL(params);
