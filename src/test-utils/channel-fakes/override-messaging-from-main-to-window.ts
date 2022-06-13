/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type {  MessageChannelListener } from "../../common/utils/channel/message-channel-listener-injection-token";
import type { MessageChannel } from "../../common/utils/channel/message-channel-injection-token";
import sendToChannelInElectronBrowserWindowInjectable from "../../main/start-main-application/lens-window/application-window/send-to-channel-in-electron-browser-window.injectable";
import type { SendToViewArgs } from "../../main/start-main-application/lens-window/application-window/lens-window-injection-token";
import enlistMessageChannelListenerInjectableInRenderer from "../../renderer/utils/channel/channel-listeners/enlist-message-channel-listener.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import { serialize } from "v8";
import { getOrInsertSet, toJS } from "../../common/utils";
import { inspect } from "util";

export const overrideMessagingFromMainToWindow = (mainDi: DiContainer) => {
  const messageChannelListenerFakesForRenderer = new Map<
    string,
    Set<MessageChannelListener<MessageChannel<any>>>
  >();

  mainDi.override(
    sendToChannelInElectronBrowserWindowInjectable,

    () =>
      (
        browserWindow,
        { channel: channelId, frameInfo, data: rawData }: SendToViewArgs,
      ) => {
        const listeners =
          messageChannelListenerFakesForRenderer.get(channelId) || new Set();

        if (frameInfo) {
          throw new Error(
            `Tried to send message to frame "${frameInfo.frameId}" in process "${frameInfo.processId}" using channel "${channelId}" which isn't supported yet.`,
          );
        }

        if (listeners.size === 0) {
          throw new Error(
            `Tried to send message to channel "${channelId}" but there where no listeners. Current channels with listeners: "${[
              ...messageChannelListenerFakesForRenderer.keys(),
            ].join('", "')}"`,
          );
        }

        const data = toJS(rawData);

        try {
          serialize(data);
        } catch (error) {
          throw new Error(`Tried to send message to channel "${channelId}" but the value cannot be serialized: ${inspect(data, {
            colors: true,
            depth: Infinity,
          })}`);
        }

        listeners.forEach((listener) => listener.handler(data));
      },
  );

  return (windowDi: DiContainer) => {
    windowDi.override(
      enlistMessageChannelListenerInjectableInRenderer,

      () => (listener) => {
        const listeners = getOrInsertSet(messageChannelListenerFakesForRenderer, listener.channel.id);

        listeners.add(listener);

        return () => {
          listeners.delete(listener);
        };
      },
    );
  };
};
