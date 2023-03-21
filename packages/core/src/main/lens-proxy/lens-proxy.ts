/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type https from "https";
import type http from "http";
import type { Cluster } from "../../common/cluster/cluster";
import type { ProxyApiRequestArgs } from "./proxy-functions";
import type { SetRequired } from "type-fest";
import type { Logger } from "../../common/logger";
import { disallowedPorts } from "./disallowed-ports";
import type { ProxyRetry } from "./proxy/retry.injectable";
import type { AttemptToListen } from "./attempt-to-listen.injectable";

export type GetClusterForRequest = (req: http.IncomingMessage) => Cluster | undefined;
export type ServerIncomingMessage = SetRequired<http.IncomingMessage, "url" | "method">;
export type LensProxyApiRequest = (args: ProxyApiRequestArgs) => void | Promise<void>;

interface Dependencies {
  attemptToListen: AttemptToListen;
  readonly logger: Logger;
  readonly proxyServer: https.Server;
  readonly proxyRetry: ProxyRetry;
}

export class LensProxy {
  constructor(private readonly dependencies: Dependencies) {}

  /**
   * Starts the lens proxy.
   * @resolves After the server is listening on a good port
   * @rejects if there is an error before that happens
   */
  async listen(): Promise<void> {
    const seenPorts = new Set<number>();

    while(true) {
      this.dependencies.proxyServer?.close();
      const port = await this.dependencies.attemptToListen();

      if (!disallowedPorts.has(port)) {
        // We didn't get a port that would result in an ERR_UNSAFE_PORT error, use it
        return;
      }

      this.dependencies.logger.warn(`[LENS-PROXY]: Proxy server has with port known to be considered unsafe to connect to by chrome, restarting...`);

      if (seenPorts.has(port)) {
        /**
         * Assume that if we have seen the port before, then the OS has looped
         * through all the ports possible and we will not be able to get a safe
         * port.
         */
        throw new Error("Failed to start LensProxy due to seeing too many unsafe ports. Please restart Lens.");
      } else {
        seenPorts.add(port);
      }
    }
  }

  close() {
    this.dependencies.logger.info("[LENS-PROXY]: Closing server");

    this.dependencies.proxyServer.close();
    this.dependencies.proxyRetry.close();
  }
}
