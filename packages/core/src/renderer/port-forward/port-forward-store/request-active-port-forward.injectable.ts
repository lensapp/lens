/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import apiBaseInjectable from "../../../common/k8s-api/api-base.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import { urlBuilderFor } from "@k8slens/utilities";
import type { ForwardedPort } from "../port-forward-item";

export type RequestActivePortForward = (portForward: ForwardedPort) => Promise<ForwardedPort | undefined>;

const requestActiveEndpoint = urlBuilderFor("/pods/port-forward/:namespace/:kind/:name");

const requestActivePortForwardInjectable = getInjectable({
  id: "request-active-port-forward",
  instantiate: (di): RequestActivePortForward => {
    const apiBase = di.inject(apiBaseInjectable);
    const logger = di.inject(loggerInjectionToken);

    return async ({ port, forwardPort, namespace, kind, name, ...rest }) => {
      try {
        const response: { port: number } = await apiBase.get(requestActiveEndpoint.compile({ namespace, kind, name }), { query: { port, forwardPort }});

        return {
          status: response.port ? "Active" : "Disabled",
          forwardPort: response.port,
          port,
          namespace,
          kind,
          name,
          ...rest,
        };
      } catch (error) {
        logger.warn(`[PORT-FORWARD-STORE] Error getting active port-forward: ${error}`, { namespace, kind, name });

        return undefined;
      }
    };
  },
});

export default requestActivePortForwardInjectable;
