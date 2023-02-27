/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { Runnable, RunnableSync } from "../../../common/runnable/types";

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

export const onLoadOfApplicationInjectionToken = getInjectionToken<Runnable>({
  id: "on-load-of-application",
});

export const beforeQuitOfFrontEndInjectionToken = getInjectionToken<RunnableSync>({
  id: "before-quit-of-front-end",
});

export const beforeQuitOfBackEndInjectionToken = getInjectionToken<RunnableSync>({
  id: "before-quit-of-back-end",
});

export const beforeElectronIsReadyInjectionToken = getInjectionToken<RunnableSync>({
  id: "before-electron-is-ready",
});

export const beforeApplicationIsLoadingInjectionToken = getInjectionToken<Runnable>({
  id: "before-application-is-loading",
});

export const afterWindowIsOpenedInjectionToken = getInjectionToken<Runnable>({
  id: "after-window-is-opened",
});

export const afterRootFrameIsReadyInjectionToken = getInjectionToken<Runnable>({
  id: "after-root-frame-is-ready",
});

export const afterApplicationIsLoadedInjectionToken = getInjectionToken<Runnable>({
  id: "after-application-is-loaded",
});
