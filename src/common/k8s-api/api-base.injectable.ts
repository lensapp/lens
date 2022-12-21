/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { lensAuthenticationHeaderValueInjectionToken } from "../auth/header-value";
import lensProxyPortInjectable from "../../features/lens-proxy/common/port.injectable";
import { apiPrefix } from "../vars";
import { lensAuthenticationHeader, lensClusterIdHeader } from "../vars/auth-header";
import isDebuggingInjectable from "../vars/is-debugging.injectable";
import isDevelopmentInjectable from "../vars/is-development.injectable";
import createJsonApiInjectable from "./create-json-api.injectable";
import lensAuthenticatedAgentInjectable from "../../features/lens-proxy/common/lens-auth-agent.injectable";
import { currentClusterIdInjectionToken } from "../../features/cluster/cluster-id/common/current-token";

const apiBaseInjectable = getInjectable({
  id: "api-base",
  instantiate: (di) => {
    const createJsonApi = di.inject(createJsonApiInjectable);
    const isDebugging = di.inject(isDebuggingInjectable);
    const isDevelopment = di.inject(isDevelopmentInjectable);
    const lensProxyPort = di.inject(lensProxyPortInjectable);
    const lensAuthenticationHeaderValue = di.inject(lensAuthenticationHeaderValueInjectionToken);
    const lensAuthenticatedAgent = di.inject(lensAuthenticatedAgentInjectable);
    const currentClusterId = di.inject(currentClusterIdInjectionToken);

    const headers = new Headers();

    headers.set(lensAuthenticationHeader, `Bearer ${lensAuthenticationHeaderValue}`);

    if (currentClusterId) {
      headers.set(lensClusterIdHeader, currentClusterId);
    }

    return createJsonApi({
      serverAddress: `https://127.0.0.1:${lensProxyPort.get()}`,
      apiBase: apiPrefix,
      debug: isDevelopment || isDebugging,
    }, {
      headers,
      agent: lensAuthenticatedAgent,
    });
  },
});

export default apiBaseInjectable;
