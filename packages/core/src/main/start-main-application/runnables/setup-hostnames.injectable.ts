/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "../../electron-app/electron-app.injectable";
import { beforeElectronIsReadyInjectionToken } from "@k8slens/application-for-electron-main";

const setupHostnamesInjectable = getInjectable({
  id: "setup-hostnames",

  instantiate: (di) => ({
    run: () => {
      const app = di.inject(electronAppInjectable);

      app.commandLine.appendSwitch("host-rules", [
        "MAP localhost 127.0.0.1",
        "MAP lens.app 127.0.0.1",
        "MAP *.lens.app 127.0.0.1",
      ].join());

      return undefined;
    },
  }),

  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default setupHostnamesInjectable;
