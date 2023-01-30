/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { spawn } from "node-pty";

// @experimental
export { afterApplicationIsLoadedInjectionToken } from "./start-main-application/runnable-tokens/after-application-is-loaded-injection-token";
export { beforeApplicationIsLoadingInjectionToken } from "./start-main-application/runnable-tokens/before-application-is-loading-injection-token";
export { beforeElectronIsReadyInjectionToken } from "./start-main-application/runnable-tokens/before-electron-is-ready-injection-token";
export { onLoadOfApplicationInjectionToken } from "./start-main-application/runnable-tokens/on-load-of-application-injection-token";
export { createApp } from "./create-app";
export * as Mobx from "mobx";
export * as MainApi from "../extensions/main-api";

export const Pty = {
  spawn,
};
