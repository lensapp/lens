/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createLensWindowInjectable from "./create-lens-window.injectable";
import lensProxyPortInjectable from "../../../lens-proxy/lens-proxy-port.injectable";
import isMacInjectable from "../../../../common/vars/is-mac.injectable";
import appNameInjectable from "../../../app-paths/app-name/app-name.injectable";
import appEventBusInjectable from "../../../../common/app-event-bus/app-event-bus.injectable";
import waitUntilBundledExtensionsAreLoadedInjectable from "./wait-until-bundled-extensions-are-loaded.injectable";
import { applicationWindowInjectionToken } from "./application-window-injection-token";

const createApplicationWindowInjectable = getInjectable({
  id: "create-application-window",

  instantiate: (parentDi) => (id: string) => {
    const windowInjectable = getInjectable({
      id: `application-window-for-${id}`,

      instantiate: (di) => {
        const createLensWindow = di.inject(createLensWindowInjectable);
        const isMac = di.inject(isMacInjectable);
        const applicationName = di.inject(appNameInjectable);
        const appEventBus = di.inject(appEventBusInjectable);
        const waitUntilBundledExtensionsAreLoaded = di.inject(waitUntilBundledExtensionsAreLoadedInjectable);
        const lensProxyPort = di.inject(lensProxyPortInjectable);

        return createLensWindow({
          id,
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

          onClose: () => {
            parentDi.deregister(windowInjectable);
          },

          beforeOpen: waitUntilBundledExtensionsAreLoaded,
        });
      },

      injectionToken: applicationWindowInjectionToken,
    });

    parentDi.register(windowInjectable);

    return parentDi.inject(windowInjectable);
  },
});

export default createApplicationWindowInjectable;
