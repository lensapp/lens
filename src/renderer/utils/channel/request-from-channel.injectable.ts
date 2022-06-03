/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import ipcRendererInjectable from "./ipc-renderer.injectable";
import { requestFromChannelInjectionToken } from "../../../common/utils/channel/request-from-channel-injection-token";
import type { RequestChannel } from "../../../common/utils/channel/request-channel-injection-token";

const requestFromChannelInjectable = getInjectable({
  id: "request-from-channel",

  instantiate: (di) => {
    const ipcRenderer = di.inject(ipcRendererInjectable);

    return async (channel, ...[request]) => {
      const { id } = channel as unknown as RequestChannel<any, any>;

      return ipcRenderer.invoke(id, request);
    };
  },

  injectionToken: requestFromChannelInjectionToken,
});

export default requestFromChannelInjectable;
