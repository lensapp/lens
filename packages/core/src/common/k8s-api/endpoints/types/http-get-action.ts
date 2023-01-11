/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { HttpHeader } from "./http-header";

/**
 * An action based on HTTP Get requests.
 */
export interface HttpGetAction {
  /**
   * Host name to connect to, defaults to the pod IP. You probably want to set \"Host\" in httpHeaders instead.
   */
  host?: string;

  /**
   * Custom headers to set in the request. HTTP allows repeated headers.
   */
  httpHeaders?: HttpHeader[];

  /**
   * Path to access on the HTTP server.
   */
  path?: string;

  /**
   * The PORT to request from.
   */
  port: string | number;

  /**
   * Scheme to use for connecting to the host.
   *
   * @default "HTTP"
   */
  scheme?: string;
}
