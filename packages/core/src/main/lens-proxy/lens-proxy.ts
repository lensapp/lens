/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type net from "net";
import type https from "https";
import type http from "http";
import type { Cluster } from "../../common/cluster/cluster";
import type { ProxyApiRequestArgs } from "./proxy-functions";
import type { SetRequired } from "type-fest";
import type { EmitAppEvent } from "../../common/app-event-bus/emit-event.injectable";
import type { Logger } from "../../common/logger";
import { disallowedPorts } from "./disallowed-ports";
import type { ProxyRetry } from "./proxy/retry.injectable";

export type GetClusterForRequest = (req: http.IncomingMessage) => Cluster | undefined;
export type ServerIncomingMessage = SetRequired<http.IncomingMessage, "url" | "method">;
export type LensProxyApiRequest = (args: ProxyApiRequestArgs) => void | Promise<void>;

interface Dependencies {
  emitAppEvent: EmitAppEvent;
  readonly lensProxyPort: { set: (portNumber: number) => void };
  readonly logger: Logger;
  readonly proxyServer: https.Server;
  readonly proxyRetry: ProxyRetry;
}

export class LensProxy {
  constructor(private readonly dependencies: Dependencies) {}

  /**
   * Starts to listen on an OS provided port. Will reject if the server throws
   * an error.
   *
   * Resolves with the port number that was picked
   */
  private attemptToListen(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.dependencies.proxyServer.listen(0, "127.0.0.1");

      this.dependencies.proxyServer
        .once("listening", () => {
          this.dependencies.proxyServer.removeAllListeners("error"); // don't reject the promise

          const { address, port } = this.dependencies.proxyServer.address() as net.AddressInfo;

          this.dependencies.lensProxyPort.set(port);

          this.dependencies.logger.info(`[LENS-PROXY]: Proxy server has started at ${address}:${port}`);

          this.dependencies.proxyServer.on("error", (error) => {
            this.dependencies.logger.info(`[LENS-PROXY]: Subsequent error: ${error}`);
          });

          this.dependencies.emitAppEvent({ name: "lens-proxy", action: "listen", params: { port }});
          resolve(port);
        })
        .once("error", (error) => {
          this.dependencies.logger.info(`[LENS-PROXY]: Proxy server failed to start: ${error}`);
          reject(error);
        });
    });
  }

  /**
   * Starts the lens proxy.
   * @resolves After the server is listening on a good port
   * @rejects if there is an error before that happens
   */
  async listen(): Promise<void> {
    const seenPorts = new Set<number>();

    while(true) {
      this.dependencies.proxyServer?.close();
      const port = await this.attemptToListen();

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
