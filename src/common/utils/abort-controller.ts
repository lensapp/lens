/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import AbortController from "abort-controller";

export class WrappedAbortController extends AbortController {
  constructor(parent?: AbortController) {
    super();

    parent?.signal.addEventListener("abort", () => {
      this.abort();
    });
  }
}
