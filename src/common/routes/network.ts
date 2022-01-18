/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteProps } from "react-router";
import type { URLParams } from "../utils/buildUrl";
import { endpointRoute } from "./endpoints";
import { ingressRoute } from "./ingresses";
import { networkPoliciesRoute } from "./network-policies";
import { servicesRoute, servicesURL } from "./services";
import { portForwardsRoute } from "./port-forwards";

export const networkRoute: RouteProps = {
  path: [
    servicesRoute,
    endpointRoute,
    ingressRoute,
    networkPoliciesRoute,
    portForwardsRoute,
  ].map(route => route.path.toString()),
};

export const networkURL = (params?: URLParams) => servicesURL(params);
