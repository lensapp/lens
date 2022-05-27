/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { requestFromChannelInjectionToken } from "../../../common/channel/request-from-channel-injection-token";
import { messageToChannelInjectionToken } from "../../../common/channel/message-to-channel-injection-token";
import requestFromChannelForMainRequestChannelInjectable from "../../../common/channel/request-from-channel-for-main/request-from-channel-for-main-request-channel.injectable";
import requestFromChannelForMainResponsePromiseInjectable from "./request-from-channel-for-main-response-promise.injectable";

const requestFromChannelInjectable = getInjectable({
  id: "request-from-channel",

  instantiate: (di) => {
    const messageToChannel = di.inject(messageToChannelInjectionToken);
    const requestFromChannelForMainMessageChannel = di.inject(requestFromChannelForMainRequestChannelInjectable);
    const getResponsePromise = (channelId: string) => di.inject(requestFromChannelForMainResponsePromiseInjectable, channelId);

    return async (channel, ...[request]) => {
      const responsePromise = getResponsePromise(channel.id);

      messageToChannel(requestFromChannelForMainMessageChannel, { channelId: channel.id, request });

      return await responsePromise.promise;

    };
  },

  injectionToken: requestFromChannelInjectionToken,
});

export default requestFromChannelInjectable;
