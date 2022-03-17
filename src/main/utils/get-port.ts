/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Readable } from "stream";
import URLParse from "url-parse";
import logger from "../logger";

interface GetPortArgs {
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
  };
  /**
   * Called when the port is found
   */
  onFind?: () => void;
  /**
   * Timeout for how long to wait for the port.
   * Default: 5s
   */
  timeout?: number;
}

/**
 * Parse lines from `stream` (assumes data comes in lines) to find the port
 * which the source of the stream is watching on.
 * @param stream A readable stream to match lines against
 * @param args The args concerning the stream
 * @returns A Promise for port number
 */
export function getPortFrom(stream: Readable, args: GetPortArgs): Promise<number> {
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
      logger.warn(`[getPortFrom]: failed to retrieve port via ${args.lineRegex.toString()}: ${logLines}`);
      reject(new Error("failed to retrieve port from stream"));
    }, args.timeout ?? 15000);

    stream.on("data", handler);
  });
}
