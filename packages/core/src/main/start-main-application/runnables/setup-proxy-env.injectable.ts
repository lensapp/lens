/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeElectronIsReadyInjectionToken } from "@k8slens/application-for-electron-main";
import getCommandLineSwitchInjectable from "../../electron-app/features/get-command-line-switch.injectable";

const setupProxyEnvInjectable = getInjectable({
  id: "setup-proxy-env",

  instantiate: (di) => ({
    run: () => {
      const getCommandLineSwitch = di.inject(getCommandLineSwitchInjectable);
      const switchValue = getCommandLineSwitch("proxy-server");

      let httpsProxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || "";

      delete process.env.HTTPS_PROXY;
      delete process.env.HTTP_PROXY;

      if (switchValue !== "") {
        httpsProxy = switchValue;
      }

      if (httpsProxy !== "") {
        process.env.APP_HTTPS_PROXY = httpsProxy;
      }

      if (getCommandLineSwitch("proxy-server") !== "") {
        process.env.HTTPS_PROXY = getCommandLineSwitch("proxy-server");
      }

      return undefined;
    },
  }),

  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default setupProxyEnvInjectable;
