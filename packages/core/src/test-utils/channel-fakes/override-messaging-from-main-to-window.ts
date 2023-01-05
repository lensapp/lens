/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type {  MessageChannelListener } from "../../common/utils/channel/message-channel-listener-injection-token";
import enlistMessageChannelListenerInjectableInRenderer from "../../renderer/utils/channel/channel-listeners/enlist-message-channel-listener.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import { getOrInsert, getOrInsertSet } from "../../common/utils";
import type { SendToViewArgs } from "../../main/start-main-application/lens-window/application-window/create-lens-window.injectable";
import { deserialize, serialize } from "v8";

type ListenerSet = Set<MessageChannelListener<any>>;
type WindowListenerMap = Map<string, ListenerSet>;
type ListenerFakeMap = Map<string, WindowListenerMap>;

export interface OverriddenWindowMessaging {
  sendToWindow(windowId: string, args: SendToViewArgs): void;
  overrideEnlistForWindow(windowDi: DiContainer, windowId: string): void;
}

export const overrideMessagingFromMainToWindow = (): OverriddenWindowMessaging => {
  const messageChannelListenerFakesForRenderer: ListenerFakeMap = new Map();

  const getWindowListeners = (channelId: string, windowId: string) => {
    const channelListeners = getOrInsert<string, WindowListenerMap>(
      messageChannelListenerFakesForRenderer,
      channelId,
      new Map(),
    );

    return getOrInsertSet(channelListeners, windowId);
  };

  return {
    overrideEnlistForWindow: (windowDi, windowId) => {
      windowDi.override(
        enlistMessageChannelListenerInjectableInRenderer,

        () => (listener) => {
          const windowListeners = getWindowListeners(
            listener.channel.id,
            windowId,
          );

          windowListeners.add(listener);

          return () => {
            windowListeners.delete(listener);
          };
        },
      );
    },
    sendToWindow: (windowId, { channel, data, frameInfo }) => {
      try {
        data = deserialize(serialize(data));
      } catch (error) {
        throw new Error(`Tried to send a message to channel "${channel}" that is not compatible with StructuredClone: ${error}`);
      }

      const windowListeners = getWindowListeners(channel, windowId);

      if (frameInfo) {
        throw new Error(
          `Tried to send message to frame "${frameInfo.frameId}" in process "${frameInfo.processId}" using channel "${channel}" which isn't supported yet.`,
        );
      }

      if (windowListeners.size === 0) {
        throw new Error(
          `Tried to send message to channel "${channel}" but there where no listeners. Current channels with listeners: "${[
            ...messageChannelListenerFakesForRenderer.keys(),
          ].join('", "')}"`,
        );
      }

      windowListeners.forEach((listener) => listener.handler(data));
    },
  };
};
