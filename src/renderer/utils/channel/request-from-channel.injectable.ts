/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ChannelRequest, ChannelResponse, RequestChannel } from "../../../common/utils/channel/request-channel";
import ipcRendererInjectable from "./ipc-renderer.injectable";

export interface RequestFromChannel {
  <Channel extends RequestChannel<void, unknown>>(channel: Channel): Promise<ChannelResponse<Channel>>;
  <Channel extends RequestChannel<unknown, unknown>>(channel: Channel, request: ChannelRequest<Channel>): Promise<ChannelResponse<Channel>>;
}

const requestFromChannelInjectable = getInjectable({
  id: "request-from-channel",

  instantiate: (di) => {
    const ipcRenderer = di.inject(ipcRendererInjectable);

    return ((channel, request) => ipcRenderer.invoke(channel.id, request)) as RequestFromChannel;
  },
});

export default requestFromChannelInjectable;
