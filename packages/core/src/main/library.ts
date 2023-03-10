/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// @experimental
export type { Environments } from "../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
export { registerLensCore } from "./register-lens-core";
export { nodeEnvInjectionToken } from "../common/vars/node-env-injection-token";

export * as Mobx from "mobx";
export * as mainExtensionApi from "../extensions/main-api";
export * as commonExtensionApi from "../extensions/common-api";
export * as Pty from "node-pty";
