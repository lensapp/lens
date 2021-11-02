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

import request from "request";

export interface DownloadFileOptions {
  url: string;
  gzip?: boolean;
  timeout?: number;
}

export interface DownloadFileTicket<T> {
  url: string;
  promise: Promise<T>;
  cancel(): void;
}

export function downloadFile({ url, timeout, gzip = true }: DownloadFileOptions): DownloadFileTicket<Buffer> {
  const fileChunks: Buffer[] = [];
  const req = request(url, { gzip, timeout });
  const promise: Promise<Buffer> = new Promise((resolve, reject) => {
    req.on("data", (chunk: Buffer) => {
      fileChunks.push(chunk);
    });
    req.once("error", err => {
      reject({ url, err });
    });
    req.once("complete", () => {
      resolve(Buffer.concat(fileChunks));
    });
  });

  return {
    url,
    promise,
    cancel() {
      req.abort();
    },
  };
}

export function downloadJson(args: DownloadFileOptions): DownloadFileTicket<any> {
  const { promise, ...rest } = downloadFile(args);

  return {
    promise: promise.then(res => JSON.parse(res.toString())),
    ...rest,
  };
}
