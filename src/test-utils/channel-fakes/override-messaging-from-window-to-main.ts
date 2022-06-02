/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import assert from "assert";
import type { MessageChannel } from "../../common/utils/channel/message-channel-injection-token";
import type { MessageChannelListener } from "../../common/utils/channel/message-channel-listener-injection-token";
import enlistMessageChannelListenerInjectableInMain from "../../main/utils/channel/channel-listeners/enlist-message-channel-listener.injectable";
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

      if (!messageChannelListenerFakesForMain.has(channelId)) {
        messageChannelListenerFakesForMain.set(channelId, new Set());
      }

      const listeners = messageChannelListenerFakesForMain.get(
        channelId,
      );

      assert(listeners);

      // TODO: Figure out typing
      listeners.add(
        listener as unknown as MessageChannelListener<MessageChannel<any>>,
      );

      return () => {
        // TODO: Figure out typing
        listeners.delete(
          listener as unknown as MessageChannelListener<MessageChannel<any>>,
        );
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

      listeners.forEach((listener) => listener.handler(message));
    });
  };
};
