/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import ipcRendererInjectable from "./ipc-renderer.injectable";
import type { Channel } from "../../common/channel/channel-injection-token";

const getValueFromChannelInjectable = getInjectable({
  id: "get-value-from-channel",

  instantiate: (di) => {
    const ipcRenderer = di.inject(ipcRendererInjectable);

    return  <TChannel extends Channel<unknown, unknown>>(
      channel: TChannel,
    ): Promise<TChannel["_returnTemplate"]> =>
      ipcRenderer.invoke(channel.id);
  },
});

export default getValueFromChannelInjectable;
