/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { Runnable } from "../../../common/runnable/run-many-for";
import type { RunnableSync } from "../../../common/runnable/run-many-sync-for";

/**
 * These tokens are here so that the importing of their respective dependencies
 * can be delayed until all of them are ready
 */

/**
 * This runnable token should only have the app paths init so that it can be run by itself
 */
export const appPathsRunnablePhaseInjectionToken = getInjectionToken<RunnableSync>({
  id: "app-paths-runnable-phase",
});

export const showLoadingRunnablePhaseInjectionToken = getInjectionToken<Runnable>({
  id: "show-loading-runnable-phase",
});

export const showInitialWindowRunnablePhaseInjectionToken = getInjectionToken<Runnable>({
  id: "show-initial-window-runnable-phase",
});
