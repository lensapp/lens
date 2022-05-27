/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannelListener } from "../../../common/channel/message-channel-listener-injection-token";
import { messageChannelListenerInjectionToken } from "../../../common/channel/message-channel-listener-injection-token";
import type { RequestFromChannelForMainRequestChannel } from "../../../common/channel/request-from-channel-for-main/request-from-channel-for-main-request-channel.injectable";
import requestFromChannelForMainRequestChannelInjectable from "../../../common/channel/request-from-channel-for-main/request-from-channel-for-main-request-channel.injectable";
import { requestChannelListenerInjectionToken } from "../../../common/channel/request-channel-listener-injection-token";
import requestFromChannelForMainResponseChannelInjectable from "../../../common/channel/request-from-channel-for-main/request-from-channel-for-main-response-channel.injectable";
import { messageToChannelInjectionToken } from "../../../common/channel/message-to-channel-injection-token";

const requestFromChannelForMainMessageChannelListenerInjectable = getInjectable(
  {
    id: "request-from-channel-for-main-message-channel-listener",

    instantiate: (di): MessageChannelListener<RequestFromChannelForMainRequestChannel> => {
      const requestChannel = di.inject(requestFromChannelForMainRequestChannelInjectable);
      const responseChannel = di.inject(requestFromChannelForMainResponseChannelInjectable);
      const messageToChannel = di.inject(messageToChannelInjectionToken);
      const listeners = di.injectMany(requestChannelListenerInjectionToken);

      return {
        channel: requestChannel,

        handler: async ({ channelId, request }) => {
          const targetListener = listeners.find(listener => listener.channel.id === channelId);

          if (targetListener) {
            const response = await targetListener.handler(request);

            messageToChannel(responseChannel, {
              channelId,
              response,
            });
          }
        },
      };
    },

    injectionToken: messageChannelListenerInjectionToken,
  },
);

export default requestFromChannelForMainMessageChannelListenerInjectable;
