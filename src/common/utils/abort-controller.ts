/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * This is like an `AbortController` but will also abort if the parent aborts,
 * but won't make the parent abort if this aborts (single direction)
 */
export class WrappedAbortController extends AbortController {
  constructor(parent?: AbortController | undefined) {
    super();

    parent?.signal.addEventListener("abort", () => {
      this.abort();
    });
  }
}
