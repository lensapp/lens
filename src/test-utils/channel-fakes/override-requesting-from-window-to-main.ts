/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import type { RequestChannel } from "../../common/utils/channel/request-channel-injection-token";
import type { RequestChannelListener } from "../../common/utils/channel/request-channel-listener-injection-token";
import enlistRequestChannelListenerInjectableInMain from "../../main/utils/channel/channel-listeners/enlist-request-channel-listener.injectable";
import requestFromChannelInjectable from "../../renderer/utils/channel/request-from-channel.injectable";

export const overrideRequestingFromWindowToMain = (mainDi: DiContainer) => {
  const requestChannelListenerFakesForMain = new Map<
      string,
      RequestChannelListener<RequestChannel<any, any>>
    >();

  mainDi.override(
    enlistRequestChannelListenerInjectableInMain,

    () => (listener) => {
      if (requestChannelListenerFakesForMain.get(listener.channel.id)) {
        throw new Error(
          `Tried to enlist listener for channel "${listener.channel.id}", but it was already enlisted`,
        );
      }

      requestChannelListenerFakesForMain.set(
        listener.channel.id,

          // TODO: Figure out typing
          listener as unknown as RequestChannelListener<
            RequestChannel<any, any>
          >,
      );

      return () => {
        requestChannelListenerFakesForMain.delete(listener.channel.id);
      };
    },
  );

  return (windowDi: DiContainer) => {
    windowDi.override(
      requestFromChannelInjectable,

      () => async (channel, ...[request]) => {
        const requestListener = requestChannelListenerFakesForMain.get(channel.id);

        if (!requestListener) {
          throw new Error(
            `Tried to get value from channel "${channel.id}", but no listeners were registered`,
          );
        }

        return requestListener.handler(request);
      },
    );
  };
};
