/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterApplicationIsReadyInjectionToken } from "../after-application-is-ready-injection-token";
import {
  getAppVersion,
  getAppVersionFromProxyServer,
} from "../../../../common/utils";
import exitAppInjectable from "../../../app-paths/get-electron-app-path/electron-app/exit-app.injectable";
import lensProxyInjectable from "../../../lens-proxy.injectable";
import loggerInjectable from "../../../../common/logger.injectable";
import { dialog } from "electron";
import lensProxyPortNumberStateInjectable from "../../../lens-proxy-port-number-state.injectable";
import isWindowsInjectable from "../../../../common/vars/is-windows.injectable";

const setupLensProxyInjectable = getInjectable({
  id: "setup-lens-proxy",

  instantiate: (di) => {
    const lensProxy = di.inject(lensProxyInjectable);
    const exitApp = di.inject(exitAppInjectable);
    const logger = di.inject(loggerInjectable);
    const lensProxyPortNumberState = di.inject(lensProxyPortNumberStateInjectable);
    const isWindows = di.inject(isWindowsInjectable);

    return {
      run: async () => {
        try {
          logger.info("🔌 Starting LensProxy");
          await lensProxy.listen(); // lensProxy.port available
        } catch (error) {
          dialog.showErrorBox("Lens Error", `Could not start proxy: ${error?.message || "unknown error"}`);

          return exitApp();
        }

        // test proxy connection
        try {
          logger.info("🔎 Testing LensProxy connection ...");
          const versionFromProxy = await getAppVersionFromProxyServer(
            lensProxyPortNumberState.get(),
          );

          if (getAppVersion() !== versionFromProxy) {
            logger.error("Proxy server responded with invalid response");

            return exitApp();
          }

          logger.info("⚡ LensProxy connection OK");
        } catch (error) {
          logger.error(`🛑 LensProxy: failed connection test: ${error}`);

          const hostsPath = isWindows
            ? "C:\\windows\\system32\\drivers\\etc\\hosts"
            : "/etc/hosts";
          const message = [
            `Failed connection test: ${error}`,
            "Check to make sure that no other versions of Lens are running",
            `Check ${hostsPath} to make sure that it is clean and that the localhost loopback is at the top and set to 127.0.0.1`,
            "If you have HTTP_PROXY or http_proxy set in your environment, make sure that the localhost and the ipv4 loopback address 127.0.0.1 are added to the NO_PROXY environment variable.",
          ];

          dialog.showErrorBox("Lens Proxy Error", message.join("\n\n"));

          return exitApp();
        }
      },
    };
  },

  causesSideEffects: true,

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default setupLensProxyInjectable;
