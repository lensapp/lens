/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import forceAppExitInjectable from "../../electron-app/features/force-app-exit.injectable";
import lensProxyInjectable from "../../lens-proxy/lens-proxy.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import lensProxyPortInjectable from "../../lens-proxy/lens-proxy-port.injectable";
import isWindowsInjectable from "../../../common/vars/is-windows.injectable";
import showErrorPopupInjectable from "../../electron-app/features/show-error-popup.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "@k8slens/application";
import lensProxyCertificateInjectable from "../../../common/certificate/lens-proxy-certificate.injectable";
import fetchInjectable from "../../../common/fetch/fetch.injectable";
import { Agent } from "https";
import { buildVersionInitializable } from "../../../features/vars/build-version/common/token";
import { buildVersionInitializationInjectable } from "../../../features/vars/build-version/main/init.injectable";

const setupLensProxyInjectable = getInjectable({
  id: "setup-lens-proxy",

  instantiate: (di) => ({
    run: async () => {
      const lensProxy = di.inject(lensProxyInjectable);
      const forceAppExit = di.inject(forceAppExitInjectable);
      const logger = di.inject(loggerInjectionToken);
      const lensProxyPort = di.inject(lensProxyPortInjectable);
      const isWindows = di.inject(isWindowsInjectable);
      const showErrorPopup = di.inject(showErrorPopupInjectable);
      const buildVersion = di.inject(buildVersionInitializable.stateToken);
      const lensProxyCertificate = di.inject(lensProxyCertificateInjectable);
      const fetch = di.inject(fetchInjectable);

      try {
        logger.info("🔌 Starting LensProxy");
        await lensProxy.listen(); // lensProxy.port available
      } catch (error: any) {
        showErrorPopup("Lens Error", `Could not start proxy: ${error?.message || "unknown error"}`);

        return forceAppExit();
      }

      // test proxy connection
      try {
        logger.info("🔎 Testing LensProxy connection ...");
        const versionResponse = await fetch(`https://127.0.0.1:${lensProxyPort.get()}/version`, {
          agent: new Agent({
            ca: lensProxyCertificate.get()?.cert,
          }),
        });

        const { version: versionFromProxy } = await versionResponse.json() as { version: string };

        if (buildVersion !== versionFromProxy) {
          logger.error("Proxy server responded with invalid response");

          return forceAppExit();
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

        return forceAppExit();
      }
    },
    runAfter: buildVersionInitializationInjectable,
  }),

  causesSideEffects: true,

  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default setupLensProxyInjectable;
