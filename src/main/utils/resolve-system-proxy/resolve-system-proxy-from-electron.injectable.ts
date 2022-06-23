/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronInjectable from "./electron.injectable";
import withErrorLoggingInjectable from "../../../common/utils/with-error-logging/with-error-logging.injectable";

const resolveSystemProxyFromElectronInjectable = getInjectable({
  id: "resolve-system-proxy-from-electron",

  instantiate: (di) => {
    const electron = di.inject(electronInjectable);
    const withErrorLoggingFor = di.inject(withErrorLoggingInjectable);

    const withErrorLogging = withErrorLoggingFor(() => "Error resolving proxy");

    return withErrorLogging(async (url: string) => {
      const webContent = electron.webContents
        .getAllWebContents()
        .find((x) => !x.isDestroyed());

      if (!webContent) {
        throw new Error(`Tried to resolve proxy for "${url}", but no browser window was available`);
      }

      return await webContent.session.resolveProxy(url);
    });
  },
});

export default resolveSystemProxyFromElectronInjectable;
