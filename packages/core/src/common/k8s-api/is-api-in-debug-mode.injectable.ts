/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import isDebuggingInjectable from "../vars/is-debugging.injectable";
import isDevelopmentInjectable from "../vars/is-development.injectable";

const isApiBaseInDebugModeInjectable = getInjectable({
  id: "is-api-base-in-debug-mode",
  instantiate: (di) => di.inject(isDebuggingInjectable) || di.inject(isDevelopmentInjectable),
});

export default isApiBaseInDebugModeInjectable;
