/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getDiForUnitTesting as getMainDi } from "../../main/getDiForUnitTesting";
import { getDiForUnitTesting as getRendererDi } from "../../renderer/getDiForUnitTesting";
import ipcMainInjectable from "../../main/app-paths/register-channel/ipc-main/ipc-main.injectable";
import ipcRendererInjectable from "../../renderer/app-paths/get-value-from-registered-channel/ipc-renderer/ipc-renderer.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import { subscribeToChannelInjectionToken } from "./subscribe-to-channel-injection-token";
import { createChannel } from "../ipc-channel/create-channel/create-channel";
import type { IpcMain, IpcRenderer, WebContents } from "electron";
import type { IpcMainEvent, IpcRendererEvent } from "../../extensions/common-api/types";
import { publishToChannelInjectionToken } from "./publish-to-channel-injection-token";
import webContentsInjectable from "../../main/communication-between-processes/web-contents/web-contents.injectable";

describe("subscribe-to-channel", () => {
  let mainDi: DiContainer;
  let rendererDi: DiContainer;
  let ipcMainStub: IpcMain;

  beforeEach(() => {
    mainDi = getMainDi({ doGeneralOverrides: true });
    rendererDi = getRendererDi({ doGeneralOverrides: true });

    const mainSubscriberMap = new Map<string|symbol, ((nativeEvent: IpcMainEvent, ...args: any[]) => void)[]>();
    const rendererSubscriberMap = new Map<string|symbol, ((nativeEvent: IpcRendererEvent, ...args: any[]) => void)[]>();

    ipcMainStub = {
      on: (channelName, subscriber) => {
        const subscribers = mainSubscriberMap.get(channelName) || [];

        mainSubscriberMap.set(channelName, [...subscribers, subscriber]);
      },

      listeners: (channelName) => {
        const listeners: Function[] = mainSubscriberMap.get(channelName);

        return listeners;
      },
    } as IpcMain;

    const ipcRendererStub = {
      send: (channelName, message) => {
        const subscribers = mainSubscriberMap.get(channelName);

        const ipcMainEventStub = {} as IpcMainEvent;

        subscribers.forEach(subscriber => {
          subscriber(
            ipcMainEventStub,
            message,
          );
        });
      },

      on: (channelName, subscriber) => {
        const subscribers = rendererSubscriberMap.get(channelName) || [];

        rendererSubscriberMap.set(channelName, [...subscribers, subscriber]);
      },
    } as IpcRenderer;

    const webContentsStub = {
      getAllWebContents: () => [
        { isDestroyed: () => true },

        {
          isDestroyed: () => false,

          send: (channelName: string, message: any) => {
            const subscribers = rendererSubscriberMap.get(channelName);

            subscribers.forEach(subscriber => subscriber(null, message));
          },
        },
      ],
    } as unknown as typeof WebContents;

    mainDi.override(webContentsInjectable, () => webContentsStub);
    mainDi.override(ipcMainInjectable, () => ipcMainStub);
    rendererDi.override(ipcRendererInjectable, () => ipcRendererStub);
  });

  it("when publishing message from renderer, notifies subscribers in all environments", () => {
    const subscribeInRenderer = rendererDi.inject(subscribeToChannelInjectionToken);
    const subscribeInMain = mainDi.inject(subscribeToChannelInjectionToken);

    const someChannel = createChannel("some-channel");
    const callbackMock = jest.fn();

    subscribeInRenderer(someChannel, (message) => callbackMock("in-renderer", message));
    subscribeInMain(someChannel, (message) => callbackMock("in-main", message));

    const publishFromRenderer = rendererDi.inject(publishToChannelInjectionToken);

    publishFromRenderer(someChannel, "some-message");

    expect(callbackMock.mock.calls).toEqual([
      ["in-main", "some-message"],
      ["in-renderer", "some-message"],
    ]);
  });

  it("when publishing message from main, notifies subscribers in all environments", () => {
    const subscribeInRenderer = rendererDi.inject(subscribeToChannelInjectionToken);
    const subscribeInMain = mainDi.inject(subscribeToChannelInjectionToken);

    const someChannel = createChannel("some-channel");
    const callbackMock = jest.fn();

    subscribeInRenderer(someChannel, (message) => callbackMock("in-renderer", message));
    subscribeInMain(someChannel, (message) => callbackMock("in-main", message));

    const publishFromMain = mainDi.inject(publishToChannelInjectionToken);

    publishFromMain(someChannel, "some-message");

    expect(callbackMock.mock.calls).toEqual([
      ["in-main", "some-message"],
      ["in-renderer", "some-message"],
    ]);
  });

  it("given subscribing from main, when publishing message from renderer, notifies the subscriber in main", () => {
    const subscribeToChannel = mainDi.inject(subscribeToChannelInjectionToken);
    const publishToChannel = rendererDi.inject(publishToChannelInjectionToken);

    const channel = createChannel("some-channel");

    const callbackMock = jest.fn();

    subscribeToChannel(channel, callbackMock);

    publishToChannel(channel, "some-message");

    expect(callbackMock).toHaveBeenCalledWith("some-message");
  });

  it("given subscribing from main, when publishing message from main, notifies the subscriber in main", () => {
    const subscribeToChannel = mainDi.inject(subscribeToChannelInjectionToken);
    const publishToChannel = mainDi.inject(publishToChannelInjectionToken);

    const channel = createChannel("some-channel");

    const callbackMock = jest.fn();

    subscribeToChannel(channel, callbackMock);

    publishToChannel(channel, "some-message");

    expect(callbackMock).toHaveBeenCalledWith("some-message");
  });
});
