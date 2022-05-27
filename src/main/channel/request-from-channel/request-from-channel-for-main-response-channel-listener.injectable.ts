/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannelListener } from "../../../common/channel/message-channel-listener-injection-token";
import { messageChannelListenerInjectionToken } from "../../../common/channel/message-channel-listener-injection-token";
import type { RequestFromChannelForMainResponseChannel } from "../../../common/channel/request-from-channel-for-main/request-from-channel-for-main-response-channel.injectable";
import requestFromChannelForMainResponseChannelInjectable from "../../../common/channel/request-from-channel-for-main/request-from-channel-for-main-response-channel.injectable";
import requestFromChannelForMainResponsePromiseInjectable from "./request-from-channel-for-main-response-promise.injectable";

const requestFromChannelForMainResponseChannelListenerInjectable =
  getInjectable({
    id: "request-from-channel-for-main-response-channel-listener",

    instantiate: (
      di,
    ): MessageChannelListener<RequestFromChannelForMainResponseChannel> => {
      const channel = di.inject(requestFromChannelForMainResponseChannelInjectable);
      const getResponsePromise = (channelId: string) => di.inject(requestFromChannelForMainResponsePromiseInjectable, channelId);

      return {
        channel,

        handler: ({ channelId, response }) => {
          const responsePromise = getResponsePromise(channelId);

          responsePromise.resolve(response);
        },
      };
    },

    injectionToken: messageChannelListenerInjectionToken,
  });

export default requestFromChannelForMainResponseChannelListenerInjectable;
