/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * Format `mode` in octal notation
 */
export function displayMode(mode: number): string {
  return `0o${mode.toString(8)}`;
}
