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
