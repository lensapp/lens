/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createLensWindowInjectable from "./create-lens-window.injectable";
import lensProxyPortInjectable from "../../../lens-proxy/lens-proxy-port.injectable";
import isMacInjectable from "../../../../common/vars/is-mac.injectable";
import waitUntilBundledExtensionsAreLoadedInjectable from "./wait-until-bundled-extensions-are-loaded.injectable";
import { applicationWindowInjectionToken } from "./application-window-injection-token";
import emitAppEventInjectable from "../../../../common/app-event-bus/emit-event.injectable";
import { runInAction } from "mobx";
import appNameInjectable from "../../../../common/vars/app-name.injectable";

const createApplicationWindowInjectable = getInjectable({
  id: "create-application-window",

  instantiate: (parentDi) => (id: string) => {
    const windowInjectable = getInjectable({
      id: `application-window-for-${id}`,

      instantiate: (di) => {
        const createLensWindow = di.inject(createLensWindowInjectable);
        const isMac = di.inject(isMacInjectable);
        const applicationName = di.inject(appNameInjectable);
        const waitUntilBundledExtensionsAreLoaded = di.inject(waitUntilBundledExtensionsAreLoadedInjectable);
        const lensProxyPort = di.inject(lensProxyPortInjectable);
        const emitAppEvent = di.inject(emitAppEventInjectable);

        return createLensWindow({
          id,
          title: applicationName,
          defaultHeight: 900,
          defaultWidth: 1440,
          getContentSource: () => ({
            url: `https://lens.app:${lensProxyPort.get()}`,
          }),
          resizable: true,
          windowFrameUtilitiesAreShown: isMac,
          titleBarStyle: isMac ? "hiddenInset" : "hidden",
          centered: false,
          onFocus: () => {
            emitAppEvent({ name: "app", action: "focus" });
          },
          onBlur: () => {
            emitAppEvent({ name: "app", action: "blur" });
          },
          onDomReady: () => {
            emitAppEvent({ name: "app", action: "dom-ready" });
          },

          onClose: () => {
            runInAction(() => {
              parentDi.deregister(windowInjectable);
            });
          },

          beforeOpen: waitUntilBundledExtensionsAreLoaded,
        });
      },

      injectionToken: applicationWindowInjectionToken,
    });

    runInAction(() => {
      parentDi.register(windowInjectable);
    });

    return parentDi.inject(windowInjectable);
  },
});

export default createApplicationWindowInjectable;
