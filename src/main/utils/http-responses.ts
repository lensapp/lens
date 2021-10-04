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
