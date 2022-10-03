/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * A custom header to be used in HTTP probes and get actions
 */
export interface HttpHeader {
  /**
   * Field name
   */
  name: string;

  /**
   * The value of the field
   */
  value: string;
}
