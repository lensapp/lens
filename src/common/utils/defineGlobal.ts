/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Setup variable in global scope (top-level object)
// Global type definition must be added separately to `mocks.d.ts` in form:
// declare const __globalName: any;

export function defineGlobal(propName: string, descriptor: PropertyDescriptor) {
  const scope = typeof global !== "undefined" ? global : window;

  if (Object.prototype.hasOwnProperty.call(scope, propName)) {
    return;
  }

  Object.defineProperty(scope, propName, descriptor);
}
