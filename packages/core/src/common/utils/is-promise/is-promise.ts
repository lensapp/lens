/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export function isPromise(reference: any): reference is Promise<any> {
  return reference?.constructor === Promise;
}
