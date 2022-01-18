/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { boundMethod, boundClass } from "autobind-decorator";
import autoBindClass, { Options } from "auto-bind";
import autoBindReactClass from "auto-bind/react";

// Automatically bind methods to their class instance
export function autoBind<T extends object>(obj: T, opts?: Options): T {
  if ("componentWillUnmount" in obj) {
    return autoBindReactClass(obj as any, opts);
  }

  return autoBindClass(obj, opts);
}

// Class/method decorators
// Note: @boundClass doesn't work with mobx-6.x/@action decorator
export {
  boundClass,
  boundMethod,
};
