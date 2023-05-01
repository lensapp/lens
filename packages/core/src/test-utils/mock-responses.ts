/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Response, Headers as NodeFetchHeaders } from "@k8slens/node-fetch";
import { PassThrough } from "stream";

export const createMockResponseFromString = (url: string, data: string, statusCode = 200) => {
  const res: jest.Mocked<Response> = {
    buffer: jest.fn(() => Promise.reject(new Error("buffer() is not supported"))),
    clone: jest.fn(() => res),
    arrayBuffer: jest.fn(() => Promise.reject(new Error("arrayBuffer() is not supported"))),
    blob: jest.fn(() => Promise.reject(new Error("blob() is not supported"))),
    body: new PassThrough(),
    bodyUsed: false,
    headers: new Headers() as NodeFetchHeaders,
    json: jest.fn(async () => JSON.parse(await res.text()) as unknown),
    ok: 200 <= statusCode && statusCode < 300,
    redirected: 300 <= statusCode && statusCode < 400,
    size: data.length,
    status: statusCode,
    statusText: "some-text",
    text: jest.fn(() => Promise.resolve(data)),
    type: "basic",
    url,
    formData: jest.fn(() => Promise.reject(new Error("formData() is not supported"))),
  };

  return res;
};

export const createMockResponseFromStream = (url: string, stream: NodeJS.ReadableStream, statusCode = 200) => {
  const res: jest.Mocked<Response> = {
    buffer: jest.fn(() => Promise.reject(new Error("buffer() is not supported"))),
    clone: jest.fn(() => res),
    arrayBuffer: jest.fn(() => Promise.reject(new Error("arrayBuffer() is not supported"))),
    blob: jest.fn(() => Promise.reject(new Error("blob() is not supported"))),
    body: stream,
    bodyUsed: false,
    headers: new Headers() as NodeFetchHeaders,
    json: jest.fn(async () => JSON.parse(await res.text()) as unknown),
    ok: 200 <= statusCode && statusCode < 300,
    redirected: 300 <= statusCode && statusCode < 400,
    size: 10,
    status: statusCode,
    statusText: "some-text",
    text: jest.fn(() => {
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        stream.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
        stream.on("error", (err) => reject(err));
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      });
    }),
    type: "basic",
    url,
    formData: jest.fn(() => Promise.reject(new Error("formData() is not supported"))),
  };

  return res;
};
