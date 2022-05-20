/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import getValueFromChannelInjectable from "../renderer/channel/get-value-from-channel.injectable";
import registerChannelInjectable from "../main/app-paths/register-channel/register-channel.injectable";
import asyncFn from "@async-fn/jest";
import type { SendToViewArgs } from "../main/start-main-application/lens-window/application-window/lens-window-injection-token";
import sendToChannelInElectronBrowserWindowInjectable from "../main/start-main-application/lens-window/application-window/send-to-channel-in-electron-browser-window.injectable";
import { isEmpty } from "lodash/fp";
import enlistChannelListenerInjectableInRenderer from "../renderer/channel/channel-listeners/enlist-channel-listener.injectable";
import enlistChannelListenerInjectableInMain from "../main/channel/channel-listeners/enlist-channel-listener.injectable";
import sendToMainInjectable from "../renderer/channel/send-to-main.injectable";
import type { Channel } from "../common/channel/channel-injection-token";

export const overrideIpcBridge = ({
  rendererDi,
  mainDi,
}: {
  rendererDi: DiContainer;
  mainDi: DiContainer;
}) => {
  const fakeChannelMap = new Map<
    string,
    { promise: Promise<any>; resolve: (arg0: any) => Promise<void> }
  >();

  const mainIpcRegistrations = {
    set: <TChannel extends Channel<unknown, unknown>>(
      channel: TChannel,
      callback: () => TChannel["_messageTemplate"],
    ) => {
      const id = channel.id;

      if (!fakeChannelMap.has(id)) {
        const mockInstance = asyncFn();

        fakeChannelMap.set(id, {
          promise: mockInstance(),
          resolve: mockInstance.resolve,
        });
      }

      return fakeChannelMap.get(id)?.resolve(callback);
    },

    get: <TChannel extends Channel<unknown, unknown>>(channel: TChannel) => {
      const id = channel.id;

      if (!fakeChannelMap.has(id)) {
        const mockInstance = asyncFn();

        fakeChannelMap.set(id, {
          promise: mockInstance(),
          resolve: mockInstance.resolve,
        });
      }

      return fakeChannelMap.get(id)?.promise;
    },
  };

  // TODO: Consolidate to using mainIpcFakeHandles
  rendererDi.override(
    getValueFromChannelInjectable,
    () => async (channel) => {
      const callback = await mainIpcRegistrations.get(channel);

      return callback();
    },
  );

  mainDi.override(registerChannelInjectable, () => (channel, callback) => {
    mainIpcRegistrations.set(channel, callback);
  });

  const rendererIpcFakeHandles = new Map<
    string,
    ((...args: any[]) => void)[]
  >();

  mainDi.override(
    sendToChannelInElectronBrowserWindowInjectable,
    () =>
      (browserWindow, { channel: channelName, data = [] }: SendToViewArgs) => {
        const handles = rendererIpcFakeHandles.get(channelName) || [];

        if (isEmpty(handles)) {
          throw new Error(
            `Tried to send message to channel "${channelName}" but there where no listeners. Current channels with listeners: "${[
              ...rendererIpcFakeHandles.keys(),
            ].join('", "')}"`,
          );
        }

        handles.forEach((handle) => handle(...data));
      },
  );

  const mainIpcFakeHandles = new Map<
    string,
    ((...args: any[]) => void)[]
  >();

  rendererDi.override(
    enlistChannelListenerInjectableInRenderer,
    () => (channel, handler) => {
      const existingHandles = rendererIpcFakeHandles.get(channel.id) || [];

      rendererIpcFakeHandles.set(channel.id, [...existingHandles, handler]);

      return () => {

      };
    },
  );

  rendererDi.override(sendToMainInjectable, () => (channelId, message) => {
    const handles = mainIpcFakeHandles.get(channelId) || [];

    if (isEmpty(handles)) {
      throw new Error(
        `Tried to send message to channel "${channelId}" but there where no listeners. Current channels with listeners: "${[
          ...mainIpcFakeHandles.keys(),
        ].join('", "')}"`,
      );
    }

    handles.forEach((handle) => handle(message));
  });

  mainDi.override(
    enlistChannelListenerInjectableInMain,
    () => (channel, handler) => {
      const existingHandles = mainIpcFakeHandles.get(channel.id) || [];

      mainIpcFakeHandles.set(channel.id, [...existingHandles, handler]);

      return () => {

      };
    },
  );
};
