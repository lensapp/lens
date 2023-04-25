/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import loggerInjectable from "../../common/logger.injectable";
import { asLegacyGlobalForExtensionApi } from "@k8slens/legacy-global-di";

// APIs
export { App } from "./app";
export * as EventBus from "./event-bus";
export * as Store from "./stores";
export * as Util from "./utils";
export * as Catalog from "./catalog";
export * as Types from "./types";
export * as Proxy from "./proxy";

export type { Logger } from "../../common/logger";
export type { LensExtension } from "../lens-extension";
export type { PackageJson } from "type-fest";
export type { LensExtensionManifest, InstalledExtension } from "@k8slens/legacy-extensions";

export const logger = asLegacyGlobalForExtensionApi(loggerInjectable);
