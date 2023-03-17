/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronBrowserWindowInjectable from "./electron-browser-window.injectable";
import withErrorLoggingInjectable from "../../../common/utils/with-error-logging/with-error-logging.injectable";

const resolveSystemProxyFromElectronInjectable = getInjectable({
  id: "resolve-system-proxy-from-electron",

  instantiate: (di) => {
    const browserWindow = di.inject(electronBrowserWindowInjectable);
    const withErrorLoggingFor = di.inject(withErrorLoggingInjectable);
    const withErrorLogging = withErrorLoggingFor(() => "Error resolving proxy");
    const hiddenWindow = browserWindow({
      show: false,
    });

    return withErrorLogging(async (url: string) => {
      return await hiddenWindow.webContents.session.resolveProxy(url);
    });
  },
});

export default resolveSystemProxyFromElectronInjectable;
