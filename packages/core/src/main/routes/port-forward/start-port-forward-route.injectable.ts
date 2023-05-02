/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteInjectable } from "../../router/router.injectable";
import { apiPrefix } from "../../../common/vars";
import { PortForward } from "./functionality/port-forward";
import createPortForwardInjectable from "./functionality/create-port-forward.injectable";
import { clusterRoute } from "../../router/route";
import { loggerInjectionToken } from "@k8slens/logger";
import kubeconfigManagerInjectable from "../../kubeconfig-manager/kubeconfig-manager.injectable";

const startPortForwardRouteInjectable = getRouteInjectable({
  id: "start-current-port-forward-route",

  instantiate: (di) => {
    const createPortForward = di.inject(createPortForwardInjectable);
    const logger = di.inject(loggerInjectionToken);

    return clusterRoute({
      method: "post",
      path: `${apiPrefix}/pods/port-forward/{namespace}/{resourceType}/{resourceName}`,
    })(async ({ params, query, cluster }) => {
      const { namespace, resourceType, resourceName } = params;
      const port = Number(query.get("port"));
      const forwardPort = Number(query.get("forwardPort"));

      const proxyKubeconfigManager = di.inject(kubeconfigManagerInjectable, cluster);

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

          const thePort = 0 < forwardPort && forwardPort < 65536
            ? forwardPort
            : 0;
          const proxyKubeconfigPath = await proxyKubeconfigManager.ensurePath();

          portForward = createPortForward(proxyKubeconfigPath, {
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
    });
  },
});

export default startPortForwardRouteInjectable;
