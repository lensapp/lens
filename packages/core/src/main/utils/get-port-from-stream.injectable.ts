/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Readable } from "stream";
import URLParse from "url-parse";
import { getInjectable } from "@ogre-tools/injectable";
import { loggerInjectionToken } from "@k8slens/logger";

export interface GetPortFromStreamArgs {
  /**
   * Should be case insensitive
   * Must have a named matching group called `address`
   */
  lineRegex: {
    match: (line: string) => {
        matched: boolean;
        groups?: {
          address?: string;
        };
        raw?: RegExpExecArray;
    };
    rawMatcher: string;
  };
  /**
   * Called when the port is found
   */
  onFind?: () => void;
  /**
   * Timeout for how long to wait for the port.
   * Default: 15s
   */
  timeout?: number;
}

export type GetPortFromStream = (stream: Readable, args: GetPortFromStreamArgs) => Promise<number>;

const getPortFromStreamInjectable = getInjectable({
  id: "get-port-from-stream",
  instantiate: (di): GetPortFromStream => {
    const logger = di.inject(loggerInjectionToken);

    return (stream, args) => {
      const logLines: string[] = [];

      return new Promise<number>((resolve, reject) => {
        const handler = (data: unknown) => {
          const logItem = String(data);
          const match = args.lineRegex.match(logItem);

          logLines.push(logItem);

          if (match.matched) {
            // use unknown protocol so that there is no default port
            const addr = new URLParse(`s://${match.groups?.address?.trim()}`);

            args.onFind?.();
            stream.off("data", handler);
            clearTimeout(timeoutID);
            resolve(+addr.port);
          }
        };
        const timeoutID = setTimeout(() => {
          stream.off("data", handler);
          logger.warn(`[getPortFrom]: failed to retrieve port via ${args.lineRegex.rawMatcher}`, logLines);
          reject(new Error("failed to retrieve port from stream"));
        }, args.timeout ?? 15000);

        stream.on("data", handler);
      });
    };
  },
});

export default getPortFromStreamInjectable;

