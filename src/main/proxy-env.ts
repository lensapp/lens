/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { app } from "electron";

const switchValue = app.commandLine.getSwitchValue("proxy-server");

export function mangleProxyEnv() {
  let httpsProxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || "";

  delete process.env.HTTPS_PROXY;
  delete process.env.HTTP_PROXY;

  if (switchValue !== "") {
    httpsProxy = switchValue;
  }

  if (httpsProxy !== "") {
    process.env.APP_HTTPS_PROXY = httpsProxy;
  }
}
