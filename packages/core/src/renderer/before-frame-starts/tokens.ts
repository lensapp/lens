/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Runnable } from "@k8slens/run-many";

// NOTE: these are run before any other token, mostly to set up things that all other runnables need
export const beforeFrameStartsFirstInjectionToken = getInjectionToken<Runnable>({
  id: "before-frame-starts-first",
});

// NOTE: these are only run when process.isMainFrame === true
export const beforeMainFrameStartsFirstInjectionToken = getInjectionToken<Runnable>({
  id: "before-main-frame-starts-first",
});

// NOTE: these are only run when process.isMainFrame === false
export const beforeClusterFrameStartsFirstInjectionToken = getInjectionToken<Runnable>({
  id: "before-cluster-frame-starts-first",
});

export const beforeFrameStartsSecondInjectionToken = getInjectionToken<Runnable>({
  id: "before-frame-starts-second",
});

// NOTE: these are only run when process.isMainFrame === true
export const beforeMainFrameStartsSecondInjectionToken = getInjectionToken<Runnable>({
  id: "before-main-frame-starts-second",
});

// NOTE: these are only run when process.isMainFrame === false
export const beforeClusterFrameStartsSecondInjectionToken = getInjectionToken<Runnable>({
  id: "before-cluster-frame-starts-second",
});

