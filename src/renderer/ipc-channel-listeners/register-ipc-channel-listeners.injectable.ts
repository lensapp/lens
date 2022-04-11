/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ipcChannelListenerInjectionToken } from "./ipc-channel-listener-injection-token";
import registerIpcChannelListenerInjectable from "../app-paths/get-value-from-registered-channel/register-ipc-channel-listener.injectable";
import { afterApplicationIsReadyInjectionToken } from "../../main/start-main-application/after-application-is-ready/after-application-is-ready-injection-token";

const registerIpcChannelListenersInjectable = getInjectable({
  id: "register-ipc-channel-listeners",

  instantiate: di => ({
    run: async () => {
      const registerIpcChannelListener = di.inject(registerIpcChannelListenerInjectable);

      const listeners = di.injectMany(ipcChannelListenerInjectionToken);

      listeners.forEach(listener => {
        registerIpcChannelListener(listener);
      });
    },
  }),

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default registerIpcChannelListenersInjectable;
