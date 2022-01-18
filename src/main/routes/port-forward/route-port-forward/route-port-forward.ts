/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import type { LensApiRequest } from "../../../router";
import logger from "../../../logger";
import { respondJson } from "../../../utils/http-responses";
import { PortForward, PortForwardArgs } from "../port-forward";

interface Dependencies {
  createPortForward: (pathToKubeConfig: string, args: PortForwardArgs) => PortForward;
}

export const routePortForward =
  ({ createPortForward }: Dependencies) =>
    async (request: LensApiRequest) => {
      const { params, query, response, cluster } = request;
      const { namespace, resourceType, resourceName } = params;
      const port = Number(query.get("port"));
      const forwardPort = Number(query.get("forwardPort"));
      const protocol = query.get("protocol");

      try {
        let portForward = PortForward.getPortforward({
          clusterId: cluster.id,
          kind: resourceType,
          name: resourceName,
          namespace,
          port,
          forwardPort,
          protocol,
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
            protocol,
          });

          const started = await portForward.start();

          if (!started) {
            logger.error("[PORT-FORWARD-ROUTE]: failed to start a port-forward", {
              namespace,
              port,
              resourceType,
              resourceName,
            });

            return respondJson(
              response,
              {
                message: `Failed to forward port ${port} to ${
                  thePort ? forwardPort : "random port"
                }`,
              },
              400,
            );
          }
        }

        respondJson(response, { port: portForward.forwardPort });
      } catch (error) {
        logger.error(
          `[PORT-FORWARD-ROUTE]: failed to open a port-forward: ${error}`,
          { namespace, port, resourceType, resourceName },
        );

        return respondJson(
          response,
          {
            message: `Failed to forward port ${port}`,
          },
          400,
        );
      }
    };
