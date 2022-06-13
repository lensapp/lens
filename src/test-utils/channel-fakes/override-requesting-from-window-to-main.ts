/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { inspect } from "util";
import { serialize } from "v8";
import { toJS } from "../../common/utils";
import type { RequestChannel } from "../../common/utils/channel/request-channel-injection-token";
import type { RequestChannelHandler } from "../../common/utils/channel/request-channel-listener-injection-token";
import enlistRequestChannelListenerInjectableInMain from "../../main/utils/channel/channel-listeners/enlist-request-channel-listener.injectable";
import requestFromChannelInjectable from "../../renderer/utils/channel/request-from-channel.injectable";

export const overrideRequestingFromWindowToMain = (mainDi: DiContainer) => {
  const requestChannelListenerFakesForMain = new Map<
      string,
      RequestChannelHandler<RequestChannel<any, any>>
    >();

  mainDi.override(
    enlistRequestChannelListenerInjectableInMain,

    () => (listener) => {
      if (requestChannelListenerFakesForMain.get(listener.channel.id)) {
        throw new Error(
          `Tried to enlist listener for channel "${listener.channel.id}", but it was already enlisted`,
        );
      }

      requestChannelListenerFakesForMain.set(listener.channel.id, listener);

      return () => {
        requestChannelListenerFakesForMain.delete(listener.channel.id);
      };
    },
  );

  return (windowDi: DiContainer) => {
    windowDi.override(
      requestFromChannelInjectable,

      () => async (channel, ...[request]) => {
        const { id } = channel as unknown as RequestChannel<any, any>;
        const requestListener = requestChannelListenerFakesForMain.get(id);

        if (!requestListener) {
          throw new Error(
            `Tried to get value from channel "${id}", but no listeners were registered`,
          );
        }

        const rawResult = await requestListener.handler(request);
        const result = toJS(rawResult);

        try {
          serialize(result);
        } catch (error) {
          throw new Error(`Tried to request value from channel "${id}" but the value cannot be serialized: ${inspect(result, {
            colors: true,
            depth: Infinity,
          })}`);
        }

        return result;
      },
    );
  };
};
