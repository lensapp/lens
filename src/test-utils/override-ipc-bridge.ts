/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DependencyInjectionContainer } from "@ogre-tools/injectable";
import type { Channel } from "../common/ipc-channel/channel";
import getValueFromRegisteredChannelInjectable from "../renderer/app-paths/get-value-from-registered-channel/get-value-from-registered-channel.injectable";
import registerChannelInjectable from "../main/app-paths/register-channel/register-channel.injectable";
import asyncFn from "@async-fn/jest";

export const overrideIpcBridge = ({
  rendererDi,
  mainDi,
}: {
  rendererDi: DependencyInjectionContainer;
  mainDi: DependencyInjectionContainer;
}) => {
  const fakeChannelMap = new Map<
    Channel<any>,
    { promise: Promise<any>; resolve: (arg0: any) => Promise<void> }
  >();

  const mainIpcRegistrations = {
    set: <TChannel extends Channel<TInstance>, TInstance>(
      key: TChannel,
      callback: () => TChannel["_template"],
    ) => {
      if (!fakeChannelMap.has(key)) {
        const mockInstance = asyncFn();

        fakeChannelMap.set(key, {
          promise: mockInstance(),
          resolve: mockInstance.resolve,
        });
      }

      return fakeChannelMap.get(key).resolve(callback);
    },

    get: <TChannel extends Channel<TInstance>, TInstance>(key: TChannel) => {
      if (!fakeChannelMap.has(key)) {
        const mockInstance = asyncFn();

        fakeChannelMap.set(key, {
          promise: mockInstance(),
          resolve: mockInstance.resolve,
        });
      }

      return fakeChannelMap.get(key).promise;
    },
  };

  rendererDi.override(
    getValueFromRegisteredChannelInjectable,
    () => async (channel) => {
      const callback = await mainIpcRegistrations.get(channel);

      return callback();
    },
  );

  mainDi.override(registerChannelInjectable, () => (channel, callback) => {
    mainIpcRegistrations.set(channel, callback);
  });
};
