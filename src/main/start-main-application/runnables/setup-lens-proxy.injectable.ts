/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getAppVersionFromProxyServer } from "../../../common/utils";
import exitAppInjectable from "../../electron-app/features/exit-app.injectable";
import lensProxyInjectable from "../../lens-proxy/lens-proxy.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import lensProxyPortInjectable from "../../lens-proxy/lens-proxy-port.injectable";
import isWindowsInjectable from "../../../common/vars/is-windows.injectable";
import showErrorPopupInjectable from "../../electron-app/features/show-error-popup.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "../runnable-tokens/before-application-is-loading-injection-token";
import buildVersionInjectable from "../../vars/build-version/build-version.injectable";

const setupLensProxyInjectable = getInjectable({
  id: "setup-lens-proxy",

  instantiate: (di) => {
    const lensProxy = di.inject(lensProxyInjectable);
    const exitApp = di.inject(exitAppInjectable);
    const logger = di.inject(loggerInjectable);
    const lensProxyPort = di.inject(lensProxyPortInjectable);
    const isWindows = di.inject(isWindowsInjectable);
    const showErrorPopup = di.inject(showErrorPopupInjectable);
    const buildVersion = di.inject(buildVersionInjectable);

    return {
      id: "setup-lens-proxy",
      run: async () => {
        try {
          logger.info("🔌 Starting LensProxy");
          await lensProxy.listen(); // lensProxy.port available
        } catch (error: any) {
          showErrorPopup("Lens Error", `Could not start proxy: ${error?.message || "unknown error"}`);

          return exitApp();
        }

        // test proxy connection
        try {
          logger.info("🔎 Testing LensProxy connection ...");
          const versionFromProxy = await getAppVersionFromProxyServer(
            lensProxyPort.get(),
          );

          if (buildVersion.get() !== versionFromProxy) {
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

          showErrorPopup("Lens Proxy Error", message.join("\n\n"));

          return exitApp();
        }
      },
    };
  },

  causesSideEffects: true,

  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default setupLensProxyInjectable;
