/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "../../router/router.injectable";
import type { LensApiRequest, Route } from "../../router/router";
import { apiPrefix } from "../../../common/vars";
import { PortForward, PortForwardArgs } from "./functionality/port-forward";
import logger from "../../logger";
import createPortForwardInjectable from "./functionality/create-port-forward.injectable";

interface Dependencies {
  createPortForward: (pathToKubeConfig: string, args: PortForwardArgs) => PortForward;
}

const startPortForward = ({ createPortForward }: Dependencies) => async (request: LensApiRequest) => {
  const { params, query, cluster } = request;
  const { namespace, resourceType, resourceName } = params;
  const port = Number(query.get("port"));
  const forwardPort = Number(query.get("forwardPort"));

  try {
    let portForward = PortForward.getPortforward({
      clusterId: cluster.id,
      kind: resourceType,
      name: resourceName,
      namespace,
      port,
      forwardPort,
    });

    if (!portForward) {
      logger.info(
        `Creating a new port-forward ${namespace}/${resourceType}/${resourceName}:${port}`,
      );

      const thePort =
          0 < forwardPort && forwardPort < 65536 ? forwardPort : 0;

      portForward = createPortForward(await cluster.getProxyKubeconfigPath(), {
        clusterId: cluster.id,
        kind: resourceType,
        namespace,
        name: resourceName,
        port,
        forwardPort: thePort,
      });

      const started = await portForward.start();

      if (!started) {
        logger.error("[PORT-FORWARD-ROUTE]: failed to start a port-forward", {
          namespace,
          port,
          resourceType,
          resourceName,
        });

        return {
          error: {
            message: `Failed to forward port ${port} to ${
              thePort ? forwardPort : "random port"
            }`,
          },
        };
      }
    }

    return { response: { port: portForward.forwardPort }};
  } catch (error) {
    logger.error(
      `[PORT-FORWARD-ROUTE]: failed to open a port-forward: ${error}`,
      { namespace, port, resourceType, resourceName },
    );

    return {
      error: {
        message: `Failed to forward port ${port}`,
      },
    };
  }
};

const startPortForwardRouteInjectable = getInjectable({
  id: "start-current-port-forward-route",

  instantiate: (di): Route<{ port: number }> => ({
    method: "post",
    path: `${apiPrefix}/pods/port-forward/{namespace}/{resourceType}/{resourceName}`,
    handler: startPortForward({ createPortForward: di.inject(createPortForwardInjectable) }),
  }),

  injectionToken: routeInjectionToken,
});

export default startPortForwardRouteInjectable;
