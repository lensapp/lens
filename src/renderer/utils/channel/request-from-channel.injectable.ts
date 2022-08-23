/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import ipcRendererInjectable from "./ipc-renderer.injectable";
import { requestFromChannelInjectionToken } from "../../../common/utils/channel/request-from-channel-injection-token";
import { pipeline } from "@ogre-tools/fp";
import { tentativeStringifyJson } from "../../../common/utils/tentative-stringify-json";
import { tentativeParseJson } from "../../../common/utils/tentative-parse-json";

const requestFromChannelInjectable = getInjectable({
  id: "request-from-channel",

  instantiate: (di) => {
    const ipcRenderer = di.inject(ipcRendererInjectable);

    return async (channel, ...[request]) =>
      await pipeline(
        request,
        tentativeStringifyJson,
        (req) => ipcRenderer.invoke(channel.id, req),
        tentativeParseJson,
      );
  },

  injectionToken: requestFromChannelInjectionToken,
});

export default requestFromChannelInjectable;
