/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Options } from "auto-bind";
import autoBindClass from "auto-bind";
import autoBindReactClass from "auto-bind/react";

// Automatically bind methods to their class instance
export function autoBind<T extends object>(obj: T, opts?: Options): T {
  if ("componentWillUnmount" in obj) {
    return autoBindReactClass(obj as any, opts);
  }

  return autoBindClass(obj, opts);
}
