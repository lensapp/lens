/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// APIs
import { App } from "./app";
import * as EventBus from "./event-bus";
import * as Store from "./stores";
import { Util } from "./utils";
import * as Catalog from "./catalog";
import * as Types from "./types";
import * as Proxy from "./proxy";
import loggerInjectable from "../../common/logger.injectable";
import { asLegacyGlobalForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";

const logger = asLegacyGlobalForExtensionApi(loggerInjectable);

export {
  App,
  EventBus,
  Catalog,
  Store,
  Types,
  Util,
  logger,
  Proxy,
};
