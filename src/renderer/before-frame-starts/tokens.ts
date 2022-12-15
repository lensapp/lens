/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Runnable } from "../../common/runnable/run-many-for";

// NOTE: these are run before any other token, mostly to set up things that all other runnables need
export const beforeFrameStartsFirstInjectionToken = getInjectionToken<Runnable>({
  id: "even-before-frame-starts",
});

// NOTE: these are only run when process.isMainFrame === true
export const beforeMainFrameStartsInjectionToken = getInjectionToken<Runnable>({
  id: "even-before-main-frame-starts",
});

// NOTE: these are only run when process.isMainFrame === false
export const beforeClusterFrameStartsInjectionToken = getInjectionToken<Runnable>({
  id: "even-before-cluster-frame-starts",
});

export const beforeFrameStartsInjectionToken = getInjectionToken<Runnable>({
  id: "before-frame-starts",
});

