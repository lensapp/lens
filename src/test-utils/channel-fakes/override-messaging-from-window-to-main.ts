/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { serialize } from "v8";
import type { MessageChannel } from "../../common/utils/channel/message-channel-injection-token";
import type { MessageChannelListener } from "../../common/utils/channel/message-channel-listener-injection-token";
import enlistMessageChannelListenerInjectableInMain from "../../main/utils/channel/channel-listeners/enlist-message-channel-listener.injectable";
import { getOrInsertSet } from "../../renderer/utils";
import sendToMainInjectable from "../../renderer/utils/channel/send-to-main.injectable";

export const overrideMessagingFromWindowToMain = (mainDi: DiContainer) => {
  const messageChannelListenerFakesForMain = new Map<
    string,
    Set<MessageChannelListener<MessageChannel<any>>>
  >();

  mainDi.override(
    enlistMessageChannelListenerInjectableInMain,

    () => (listener) => {
      const channelId = listener.channel.id;
      const listeners = getOrInsertSet(messageChannelListenerFakesForMain, channelId);

      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  );

  return (windowDi: DiContainer) => {
    windowDi.override(sendToMainInjectable, () => (channelId, message) => {
      const listeners =
        messageChannelListenerFakesForMain.get(channelId) || new Set();

      if (listeners.size === 0) {
        throw new Error(
          `Tried to send message to channel "${channelId}" but there where no listeners. Current channels with listeners: "${[
            ...messageChannelListenerFakesForMain.keys(),
          ].join('", "')}"`,
        );
      }

      try {
        serialize(message);
      } catch {
        throw new Error(`Tried to send message to main channel "${channelId}" but the value cannot be serialized.`);
      }

      listeners.forEach((listener) => listener.handler(message));
    });
  };
};
