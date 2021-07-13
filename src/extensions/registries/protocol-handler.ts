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

/**
 * ProtocolHandlerRegistration is the data required for an extension to register
 * a handler to a specific path or dynamic path.
 */
export interface ProtocolHandlerRegistration {
  pathSchema: string;
  handler: RouteHandler;
}

/**
 * The collection of the dynamic parts of a URI which initiated a `lens://`
 * protocol request
 */
export interface RouteParams {
  /**
   * the parts of the URI query string
   */
  search: Record<string, string>;

  /**
   * the matching parts of the path. The dynamic parts of the URI path.
   */
  pathname: Record<string, string>;

  /**
   * if the most specific path schema that is matched does not cover the whole
   * of the URI's path. Then this field will be set to the remaining path
   * segments.
   *
   * Example:
   *
   * If the path schema `/landing/:type` is the matched schema for the URI
   * `/landing/soft/easy` then this field will be set to `"/easy"`.
   */
  tail?: string;
}

/**
 * RouteHandler represents the function signature of the handler function for
 * `lens://` protocol routing.
 */
export interface RouteHandler {
  (params: RouteParams): void;
}
