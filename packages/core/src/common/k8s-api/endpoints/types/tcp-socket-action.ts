/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * An action based on opening a socket
 */
export interface TcpSocketAction {
  /**
   * Host name to connect to, defaults to the pod IP.
   */
  host?: string;

  /**
   * Port to connect to
   */
  port: number | string;
}
