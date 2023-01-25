/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type http from "http";

/**
 * Respond to a HTTP request with a body of JSON data
 * @param res The HTTP response to write data to
 * @param content The data or its JSON stringified version of it
 * @param status [200] The status code to respond with
 */
export function respondJson(res: http.ServerResponse, content: Object | string, status = 200) {
  const normalizedContent = typeof content === "object"
    ? JSON.stringify(content)
    : content;

  respond(res, normalizedContent, "application/json", status);
}

/**
 * Respond to a HTTP request with a body of plain text data
 * @param res The HTTP response to write data to
 * @param content The string data to respond with
 * @param status [200] The status code to respond with
 */
export function respondText(res: http.ServerResponse, content: string, status = 200) {
  respond(res, content, "text/plain", status);
}

/**
 * Respond to a HTTP request with a body of plain text data
 * @param res The HTTP response to write data to
 * @param content The string data to respond with
 * @param contentType The HTTP Content-Type header value
 * @param status [200] The status code to respond with
 */
export function respond(res: http.ServerResponse, content: string, contentType: string, status = 200) {
  res.setHeader("Content-Type", contentType);
  res.statusCode = status;
  res.end(content);
}
