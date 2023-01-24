/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * SELinuxOptions are the labels to be applied to the container
 */
export interface SeLinuxOptions {
  /**
   * The SELinux `level` label that applies to the container.
   */
  level?: string;

  /**
   * The SELinux `role` label that applies to the container.
   */
  role?: string;

  /**
   * The SELinux `type` label that applies to the container.
   */
  type?: string;

  /**
   * The SELinux `user` label that applies to the container.
   */
  user?: string;
}
