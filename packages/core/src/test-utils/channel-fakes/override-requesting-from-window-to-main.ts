/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { deserialize, serialize } from "v8";
import type { RequestChannel } from "../../common/utils/channel/request-channel-listener-injection-token";
import type { RequestFromChannel } from "../../common/utils/channel/request-from-channel-injection-token";
import enlistRawRequestChannelListenerInjectable from "../../main/utils/channel/channel-listeners/enlist-raw-request-channel-listener.injectable";
import enlistRequestChannelListenerInjectableInMain from "../../main/utils/channel/channel-listeners/enlist-request-channel-listener.injectable";
import type { RawRequestChannelListener, RequestChannelListener } from "../../main/utils/channel/channel-listeners/listener-tokens";
import requestFromChannelInjectable from "../../renderer/utils/channel/request-from-channel.injectable";

export const overrideRequestingFromWindowToMain = (mainDi: DiContainer) => {
  const requestChannelListenerFakesForMain = new Map<
    string,
    RequestChannelListener<RequestChannel<unknown, unknown>>
  >();
  const rawRequestChannelListenerFakesForMain = new Map<
    string,
    RawRequestChannelListener<RequestChannel<unknown, unknown>>
  >();

  mainDi.override(
    enlistRequestChannelListenerInjectableInMain,

    () => (listener) => {
      if (requestChannelListenerFakesForMain.has(listener.channel.id)) {
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
  mainDi.override(
    enlistRawRequestChannelListenerInjectable,
    () => (listener) => {
      if (requestChannelListenerFakesForMain.has(listener.channel.id)) {
        throw new Error(
          `Tried to enlist listener for channel "${listener.channel.id}", but it was already enlisted`,
        );
      }

      rawRequestChannelListenerFakesForMain.set(listener.channel.id, listener);

      return () => {
        rawRequestChannelListenerFakesForMain.delete(listener.channel.id);
      };
    },
  );

  return (windowDi: DiContainer) => {
    windowDi.override(
      requestFromChannelInjectable,
      () => (async (channel, request) => {
        try {
          request = deserialize(serialize(request));
        } catch (error) {
          throw new Error(`Tried to request from channel "${channel.id}" with data that is not compatible with StructuredClone: ${error}`);
        }

        const requestListener = requestChannelListenerFakesForMain.get(channel.id);

        if (requestListener) {
          return requestListener.handler(request);
        }

        const rawRequestListener = rawRequestChannelListenerFakesForMain.get(channel.id);

        if (rawRequestListener) {
          return rawRequestListener.handler({
            frameId: 1,
            processId: 123,
          } as Electron.IpcMainInvokeEvent, request);
        }

        throw new Error(
          `Tried to get value from channel "${channel.id}", but no listeners were registered`,
        );
      }) as RequestFromChannel,
    );
  };
};
