/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * Conditionally run a test
 */
export function itIf(condition: boolean) {
  return condition ? it : it.skip;
}

/**
 * Conditionally run a block of tests
 */
export function describeIf(condition: boolean) {
  return condition ? describe : describe.skip;
}
