/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { lensWindowInjectionToken } from "./lens-window-injection-token";
import createLensWindowInjectable from "./create-lens-window.injectable";
import lensProxyPortInjectable from "../../../lens-proxy/lens-proxy-port.injectable";
import isMacInjectable from "../../../../common/vars/is-mac.injectable";
import appNameInjectable from "../../../app-paths/app-name/app-name.injectable";
import appEventBusInjectable from "../../../../common/app-event-bus/app-event-bus.injectable";
import { delay } from "../../../../common/utils";
import { bundledExtensionsLoaded } from "../../../../common/ipc/extension-handling";
import ipcMainInjectable from "../../../utils/channel/ipc-main/ipc-main.injectable";

const applicationWindowInjectable = getInjectable({
  id: "application-window",

  instantiate: (di) => {
    const createLensWindow = di.inject(createLensWindowInjectable);
    const isMac = di.inject(isMacInjectable);
    const applicationName = di.inject(appNameInjectable);
    const appEventBus = di.inject(appEventBusInjectable);
    const ipcMain = di.inject(ipcMainInjectable);
    const lensProxyPort = di.inject(lensProxyPortInjectable);

    return createLensWindow({
      id: "only-application-window",
      title: applicationName,
      defaultHeight: 900,
      defaultWidth: 1440,
      getContentSource: () => ({
        url: `http://localhost:${lensProxyPort.get()}`,
      }),
      resizable: true,
      windowFrameUtilitiesAreShown: isMac,
      titleBarStyle: isMac ? "hiddenInset" : "hidden",
      centered: false,
      onFocus: () => {
        appEventBus.emit({ name: "app", action: "focus" });
      },
      onBlur: () => {
        appEventBus.emit({ name: "app", action: "blur" });
      },
      onDomReady: () => {
        appEventBus.emit({ name: "app", action: "dom-ready" });
      },
      beforeOpen: async () => {
        const viewHasLoaded = new Promise<void>((resolve) => {
          ipcMain.once(bundledExtensionsLoaded, () => resolve());
        });

        await viewHasLoaded;
        await delay(50); // wait just a bit longer to let the first round of rendering happen
      },
    });
  },

  injectionToken: lensWindowInjectionToken,
});

export default applicationWindowInjectable;
