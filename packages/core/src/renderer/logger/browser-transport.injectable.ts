/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import BrowserConsole from "winston-transport-browserconsole";
import { loggerTransportInjectionToken } from "@k8slens/logger";

const browserLoggerTransportInjectable = getInjectable({
  id: "browser-logger-transport",
  instantiate: () => new BrowserConsole(),
  injectionToken: loggerTransportInjectionToken,
  decorable: false,
});

export default browserLoggerTransportInjectable;
