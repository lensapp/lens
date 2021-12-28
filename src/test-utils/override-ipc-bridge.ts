/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import type { DependencyInjectionContainer } from "@ogre-tools/injectable";
import type { Channel } from "../common/ipc-channel/channel";
import getValueFromRegisteredChannelInjectable from "../renderer/components/app-paths/get-value-from-registered-channel/get-value-from-registered-channel.injectable";
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
