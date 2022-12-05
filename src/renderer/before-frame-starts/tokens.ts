/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Runnable } from "../../common/runnable/run-many-for";

export const evenBeforeFrameStartsInjectionToken = getInjectionToken<Runnable>({
  id: "even-before-frame-starts",
});

// NOTE: these are only run when process.isMainFrame === true
export const evenBeforeMainFrameStartsInjectionToken = getInjectionToken<Runnable>({
  id: "even-before-main-frame-starts",
});

// NOTE: these are only run when process.isMainFrame === false
export const evenBeforeClusterFrameStartsInjectionToken = getInjectionToken<Runnable>({
  id: "even-before-cluster-frame-starts",
});

export const beforeFrameStartsInjectionToken = getInjectionToken<Runnable>({
  id: "before-frame-starts",
});

