/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../../../common/logger.injectable";
import { hasTypedProperty, isObject, isString } from "../../../../common/utils";
import { getStartableStoppable } from "../../../../common/utils/get-startable-stoppable";
import isWindowsInjectable from "../../../../common/vars/is-windows.injectable";
import exitAppInjectable from "../../../electron-app/features/exit-app.injectable";
import showErrorPopupInjectable from "../../../electron-app/features/show-error-popup.injectable";
import lensProxyInjectable from "../../../lens-proxy/lens-proxy.injectable";
import buildVersionInjectable from "../../../vars/build-version/build-version.injectable";
import requestAppVersionViaProxyInjectable from "./request-app-version.injectable";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isObject(error) && hasTypedProperty(error, "message", isString)) {
    return error.message;
  }

  return fallback;
};

const setupLensProxyStartableStoppableInjectable = getInjectable({
  id: "setup-lens-proxy-startable-stoppable",
  instantiate: (di) => {
    const lensProxy = di.inject(lensProxyInjectable);
    const exitApp = di.inject(exitAppInjectable);
    const logger = di.inject(loggerInjectable);
    const requestAppVersionViaProxy = di.inject(requestAppVersionViaProxyInjectable);
    const isWindows = di.inject(isWindowsInjectable);
    const showErrorPopup = di.inject(showErrorPopupInjectable);
    const buildVersion = di.inject(buildVersionInjectable);

    return getStartableStoppable("setup-lens-proxy", () => {
      const controller = new AbortController();

      (async () => {
        try {
          logger.info("🔌 Starting LensProxy");
          await lensProxy.listen({ signal: controller.signal }); // lensProxy.port available
        } catch (error) {
          if (!controller.signal.aborted) {
            showErrorPopup("Lens Error", `Could not start proxy: ${getErrorMessage(error, "unknown error")}`);
            exitApp();
          }

          return;
        }

        // test proxy connection
        try {
          logger.info("🔎 Testing LensProxy connection ...");
          const versionFromProxy = await requestAppVersionViaProxy({ signal: controller.signal });

          if (buildVersion.get() !== versionFromProxy) {
            logger.error("Proxy server responded with invalid response");

            return exitApp();
          }

          logger.info("⚡ LensProxy connection OK");
        } catch (error) {
          if (controller.signal.aborted) {
            return;
          }

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
      })();

      return () => controller.abort();
    });
  },
});

export default setupLensProxyStartableStoppableInjectable;
