/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { noop } from "lodash/fp";
import { ipcChannelListenerInjectionToken } from "./ipc-channel-listener-injection-token";
import registerIpcChannelListenerInjectable from "../app-paths/get-value-from-registered-channel/register-ipc-channel-listener.injectable";

const registerIpcChannelListenersInjectable = getInjectable({
  id: "register-ipc-channel-listeners",

  setup: async di => {
    const registerIpcChannelListener = await di.inject(registerIpcChannelListenerInjectable);
    const listeners = await di.injectMany(ipcChannelListenerInjectionToken);

    listeners.forEach(registerIpcChannelListener);
  },

  instantiate: () => noop,
});

export default registerIpcChannelListenersInjectable;
