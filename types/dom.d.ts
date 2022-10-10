/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export {};

declare global {
  interface Element {
    scrollIntoViewIfNeeded?(opt_center?: boolean): void;
  }
}
