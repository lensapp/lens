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
import assert from "assert";
import { tentativeParseJson } from "../../common/utils/tentative-parse-json";

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
        { channel: channelId, frameInfo, data = [] }: SendToViewArgs,
      ) => {
        const listeners =
          messageChannelListenerFakesForRenderer.get(channelId) || new Set();

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

        if (listeners.size === 0) {
          throw new Error(
            `Tried to send message to channel "${channelId}" but there where no listeners. Current channels with listeners: "${[
              ...messageChannelListenerFakesForRenderer.keys(),
            ].join('", "')}"`,
          );
        }

        const message = tentativeParseJson(data[0]);

        listeners.forEach((listener) => listener.handler(message));
      },
  );

  return (windowDi: DiContainer) => {
    windowDi.override(
      enlistMessageChannelListenerInjectableInRenderer,

      () => (listener) => {
        if (!messageChannelListenerFakesForRenderer.has(listener.channel.id)) {
          messageChannelListenerFakesForRenderer.set(
            listener.channel.id,
            new Set(),
          );
        }

        const listeners = messageChannelListenerFakesForRenderer.get(
          listener.channel.id,
        );

        assert(listeners);

        // TODO: Figure out typing
        listeners.add(
          listener as unknown as MessageChannelListener<MessageChannel<any>>,
        );

        return () => {
          // TODO: Figure out typing
          listeners.delete(
            listener as unknown as MessageChannelListener<
              MessageChannel<any>
            >,
          );
        };
      },
    );
  };
};
