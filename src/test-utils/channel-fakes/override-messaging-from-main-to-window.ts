/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type {  MessageChannelListener } from "../../common/utils/channel/message-channel-listener-injection-token";
import sendToChannelInElectronBrowserWindowInjectable from "../../main/start-main-application/lens-window/application-window/send-to-channel-in-electron-browser-window.injectable";
import type { SendToViewArgs } from "../../main/start-main-application/lens-window/application-window/create-lens-window.injectable";
import enlistMessageChannelListenerInjectableInRenderer from "../../renderer/utils/channel/channel-listeners/enlist-message-channel-listener.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import { tentativeParseJson } from "../../common/utils/tentative-parse-json";
import { getOrInsert } from "../../common/utils";

type ListenerSet = Set<MessageChannelListener<any>>;
type WindowListenerMap = Map<string, ListenerSet>;
type ListenerFakeMap = Map<string, WindowListenerMap>;

export const overrideMessagingFromMainToWindow = (mainDi: DiContainer) => {
  const messageChannelListenerFakesForRenderer: ListenerFakeMap = new Map();

  const getWindowListeners = (channelId: string, windowId: string) => {
    const channelListeners = getOrInsert<string, WindowListenerMap>(
      messageChannelListenerFakesForRenderer,
      channelId,
      new Map(),
    );

    return getOrInsert<string, ListenerSet>(
      channelListeners,
      windowId,
      new Set(),
    );
  };

  mainDi.override(
    sendToChannelInElectronBrowserWindowInjectable,

    () =>
      (
        windowId: string,
        browserWindow,
        { channel: channelId, frameInfo, data = [] }: SendToViewArgs,
      ) => {
        const windowListeners = getWindowListeners(channelId, windowId);

        if (frameInfo) {
          throw new Error(
            `Tried to send message to frame "${frameInfo.frameId}" in process "${frameInfo.processId}" using channel "${channelId}" which isn't supported yet.`,
          );
        }

        if (data.length > 1) {
          throw new Error(
            `Tried to send message to channel "${channelId}" with more than one argument which is not supported in MessageChannelListener yet.`,
          );
        }

        if (windowListeners.size === 0) {
          throw new Error(
            `Tried to send message to channel "${channelId}" but there where no listeners. Current channels with listeners: "${[
              ...messageChannelListenerFakesForRenderer.keys(),
            ].join('", "')}"`,
          );
        }

        const message = tentativeParseJson(data[0]);

        windowListeners.forEach((listener) =>
          listener.handler(message),
        );
      },
  );

  return (windowDi: DiContainer, windowId: string) => {
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
  };
};
