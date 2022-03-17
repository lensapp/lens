/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import request from "request";
import type { JsonValue } from "type-fest";
import { parse } from "./json";

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

export function downloadJson(args: DownloadFileOptions): DownloadFileTicket<JsonValue> {
  const { promise, ...rest } = downloadFile(args);

  return {
    promise: promise.then(res => parse(res.toString())),
    ...rest,
  };
}
