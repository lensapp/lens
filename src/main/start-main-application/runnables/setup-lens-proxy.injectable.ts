/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import exitAppInjectable from "../../electron-app/features/exit-app.injectable";
import lensProxyInjectable from "../../lens-proxy/lens-proxy.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import isWindowsInjectable from "../../../common/vars/is-windows.injectable";
import showErrorPopupInjectable from "../../electron-app/features/show-error-popup.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "../runnable-tokens/before-application-is-loading-injection-token";
import buildVersionInjectable from "../../vars/build-version/build-version.injectable";
import initializeBuildVersionInjectable from "../../vars/build-version/init.injectable";
import lensFetchInjectable from "../../../common/fetch/lens-fetch.injectable";
import initAuthHeaderStateInjectable from "../../../features/auth-header/main/init-state.injectable";
import { hasTypedProperty, isObject, isString, json } from "../../../common/utils";

const setupLensProxyInjectable = getInjectable({
  id: "setup-lens-proxy",

  instantiate: (di) => ({
    id: "setup-lens-proxy",
    run: async () => {
      const lensProxy = di.inject(lensProxyInjectable);
      const exitApp = di.inject(exitAppInjectable);
      const logger = di.inject(loggerInjectable);
      const isWindows = di.inject(isWindowsInjectable);
      const showErrorPopup = di.inject(showErrorPopupInjectable);
      const buildVersion = di.inject(buildVersionInjectable);
      const lensFetch = di.inject(lensFetchInjectable);

      const showProxyError = (error: string) => {
        const hostsPath = isWindows
          ? "C:\\windows\\system32\\drivers\\etc\\hosts"
          : "/etc/hosts";
        const message = [
          `Failed connection test: ${error}`,
          "Check to make sure that no other versions of Lens are running",
          `Check ${hostsPath} to make sure that it is clean and that the localhost loopback is at the top and set to 127.0.0.1`,
          "If you have HTTP_PROXY or http_proxy set in your environment, make sure that the localhost and the ipv4 loopback address 127.0.0.1 are added to the NO_PROXY environment variable.",
        ].join("\n\n");

        logger.error(`🛑 LensProxy: failed connection test: ${error}`);
        showErrorPopup("Lens Proxy Error", message);
        exitApp();
      };

      try {
        logger.info("🔌 Starting LensProxy");
        await lensProxy.listen(); // lensProxy.port available
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown error";

        showErrorPopup("Lens Error", `Could not start proxy: ${message}`);
        exitApp();

        return;
      }

      logger.info("🔎 Testing LensProxy connection ...");
      const versionResponse = await lensFetch("/version");

      if (versionResponse.status !== 200) {
        return showProxyError(`failed to GET /version: ${versionResponse.statusText}`);
      }

      const body = await versionResponse.text();
      const { isOk, value, error } = json.parse(body);

      if (!isOk) {
        return showProxyError(`failed to parse response body ${error.cause} for "${error.text}"`);
      }

      if (!isObject(value) || !hasTypedProperty(value, "version", isString)) {
        return showProxyError(`invalid data returned: "${body}"`);
      }

      if (buildVersion.get() !== value.version) {
        return showProxyError("Proxy server response with unexpeced version");
      }

      logger.info("⚡ LensProxy connection OK");
    },
    runAfter: [
      di.inject(initializeBuildVersionInjectable),
      di.inject(initAuthHeaderStateInjectable),
    ],
  }),
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default setupLensProxyInjectable;
