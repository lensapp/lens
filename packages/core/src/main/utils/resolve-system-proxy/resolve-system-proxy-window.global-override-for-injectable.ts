/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../../../common/test-utils/get-global-override";
import type { BrowserWindow, Session, WebContents } from "electron";
import resolveSystemProxyWindowInjectable from "./resolve-system-proxy-window.injectable";

export default getGlobalOverride(
  resolveSystemProxyWindowInjectable,
  () => ({
    webContents: {
      session: {
        resolveProxy: () => "DIRECT",
      } as unknown as Session,
    } as unknown as WebContents,
  } as unknown as BrowserWindow),
);
