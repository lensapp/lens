/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { deserialize, serialize } from "v8";
import type { MessageChannel, MessageChannelListener } from "../../common/utils/channel/message-channel-listener-injection-token";
import enlistMessageChannelListenerInjectableInMain from "../../main/utils/channel/channel-listeners/enlist-message-channel-listener.injectable";
import { getOrInsertSet } from "../../renderer/utils";
import sendToMainInjectable from "../../renderer/utils/channel/send-to-main.injectable";

export const overrideMessagingFromWindowToMain = (mainDi: DiContainer) => {
  const messageChannelListenerFakesForMain = new Map<
    string,
    Set<MessageChannelListener<MessageChannel<unknown>>>
  >();

  mainDi.override(
    enlistMessageChannelListenerInjectableInMain,

    () => (listener) => {
      const listeners = getOrInsertSet(messageChannelListenerFakesForMain, listener.channel.id);

      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  );

  return (windowDi: DiContainer) => {
    windowDi.override(sendToMainInjectable, () => (channelId, message) => {
      const listeners = messageChannelListenerFakesForMain.get(channelId);

      if (!listeners || listeners.size === 0) {
        throw new Error(
          `Tried to send message to channel "${channelId}" but there where no listeners. Current channels with listeners: "${[
            ...messageChannelListenerFakesForMain.keys(),
          ].join('", "')}"`,
        );
      }

      try {
        message = deserialize(serialize(message));
      } catch (error) {
        throw new Error(`Tried to send a message to channel "${channelId}" that is not compatible with StructuredClone: ${error}`);
      }

      listeners.forEach((listener) => listener.handler(message));
    });
  };
};
