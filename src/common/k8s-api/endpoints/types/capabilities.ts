/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * Adds and removes POSIX capabilities from running containers.
 */
export interface Capabilities {
  /**
   * Added capabilities
   */
  add?: string[];

  /**
   * Removed capabilities
   */
  drop?: string[];
}
