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

import type { Readable } from "stream";
import URLParse from "url-parse";
import logger from "../../common/logger";

interface GetPortArgs {
  /**
   * Should be case insensitive
   * Must have a named matching group called `address`
   */
  lineRegex: RegExp;
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
    const handler = (data: any) => {
      const logItem: string = data.toString();
      const match = logItem.match(args.lineRegex);

      logLines.push(logItem);

      if (match) {
        // use unknown protocol so that there is no default port
        const addr = new URLParse(`s://${match.groups.address.trim()}`);

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
