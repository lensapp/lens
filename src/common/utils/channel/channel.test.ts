/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { SendMessageToChannel } from "./message-to-channel-injection-token";
import { sendMessageToChannelInjectionToken } from "./message-to-channel-injection-token";
import type { ApplicationBuilder } from "../../../features/test-utils/application-builder";
import { setupInitializingApplicationBuilder } from "../../../features/test-utils/application-builder";
import type { LensWindow } from "../../../main/start-main-application/lens-window/application-window/create-lens-window.injectable";
import type { MessageChannel } from "./message-channel-listener-injection-token";
import { messageChannelListenerInjectionToken } from "./message-channel-listener-injection-token";
import type { RequestChannel } from "./request-channel";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { getPromiseStatus } from "../../test-utils/get-promise-status";
import { runInAction } from "mobx";
import type { RequestChannelHandler } from "../../../main/utils/channel/channel-listeners/listener-tokens";
import { getRequestChannelListenerInjectable } from "../../../main/utils/channel/channel-listeners/listener-tokens";
import type { RequestFromChannel } from "../../../renderer/utils/channel/request-from-channel.injectable";
import requestFromChannelInjectable from "../../../renderer/utils/channel/request-from-channel.injectable";

type TestMessageChannel = MessageChannel<string>;
type TestRequestChannel = RequestChannel<string, string>;

describe("channel", () => {
  let builder: ApplicationBuilder;

  setupInitializingApplicationBuilder(b => builder = b);

  describe("messaging from main to renderer, given listener for channel in a window and application has started", () => {
    let messageListenerInWindowMock: jest.Mock;
    let mainDi: DiContainer;
    let messageToChannel: SendMessageToChannel;

    beforeEach(async () => {
      messageListenerInWindowMock = jest.fn();

      const testChannelListenerInTestWindowInjectable = getInjectable({
        id: "test-channel-listener-in-test-window",

        instantiate: () => ({
          channel: testMessageChannel,
          handler: messageListenerInWindowMock,
        }),

        injectionToken: messageChannelListenerInjectionToken,
      });

      builder.beforeWindowStart((windowDi) => {
        runInAction(() => {
          windowDi.register(testChannelListenerInTestWindowInjectable);
        });
      });

      mainDi = builder.mainDi;

      await builder.startHidden();

      messageToChannel = mainDi.inject(sendMessageToChannelInjectionToken);
    });

    describe("given window is started", () => {
      let someWindowFake: LensWindow;

      beforeEach(async () => {
        someWindowFake = builder.applicationWindow.create("some-window");

        await someWindowFake.start();
      });

      it("when sending message, triggers listener in window", () => {
        messageToChannel(testMessageChannel, "some-message");

        expect(messageListenerInWindowMock).toHaveBeenCalledWith("some-message");
      });

      it("given window is hidden, when sending message, does not trigger listener in window", () => {
        someWindowFake.close();

        messageToChannel(testMessageChannel, "some-message");

        expect(messageListenerInWindowMock).not.toHaveBeenCalled();
      });
    });

    it("given multiple started windows, when sending message, triggers listeners in all windows", async () => {
      const someWindowFake = builder.applicationWindow.create("some-window");
      const someOtherWindowFake = builder.applicationWindow.create("some-other-window");

      await someWindowFake.start();
      await someOtherWindowFake.start();

      messageToChannel(testMessageChannel, "some-message");

      expect(messageListenerInWindowMock.mock.calls).toEqual([
        ["some-message"],
        ["some-message"],
      ]);
    });
  });

  describe("messaging from renderer to main, given listener for channel in a main and application has started", () => {
    let messageListenerInMainMock: jest.Mock;
    let messageToChannel: SendMessageToChannel;

    beforeEach(async () => {
      messageListenerInMainMock = jest.fn();

      const testChannelListenerInMainInjectable = getInjectable({
        id: "test-channel-listener-in-main",

        instantiate: () => ({
          channel: testMessageChannel,
          handler: messageListenerInMainMock,
        }),

        injectionToken: messageChannelListenerInjectionToken,
      });

      builder.beforeApplicationStart((mainDi) => {
        runInAction(() => {
          mainDi.register(testChannelListenerInMainInjectable);
        });
      });

      await builder.render();

      const windowDi = builder.applicationWindow.only.di;

      messageToChannel = windowDi.inject(sendMessageToChannelInjectionToken);
    });

    it("when sending message, triggers listener in main", () => {
      messageToChannel(testMessageChannel, "some-message");

      expect(messageListenerInMainMock).toHaveBeenCalledWith("some-message");
    });
  });

  describe("requesting from main in renderer, given listener for channel in a main and application has started", () => {
    let requestListenerInMainMock: AsyncFnMock<RequestChannelHandler<TestRequestChannel>>;
    let requestFromChannel: RequestFromChannel;

    beforeEach(async () => {
      requestListenerInMainMock = asyncFn();

      const testChannelListenerInMainInjectable = getRequestChannelListenerInjectable({
        channel: testRequestChannel,
        handler: () => requestListenerInMainMock,
      });

      builder.beforeApplicationStart((mainDi) => {
        runInAction(() => {
          mainDi.register(testChannelListenerInMainInjectable);
        });
      });

      await builder.render();

      const windowDi = builder.applicationWindow.only.di;

      requestFromChannel = windowDi.inject(requestFromChannelInjectable);
    });

    describe("when requesting from channel", () => {
      let actualPromise: Promise<string>;

      beforeEach(() => {
        actualPromise = requestFromChannel(testRequestChannel, "some-request");
      });

      it("triggers listener in main", () => {
        expect(requestListenerInMainMock).toHaveBeenCalledWith("some-request");
      });

      it("does not resolve yet", async () => {
        const promiseStatus = await getPromiseStatus(actualPromise);

        expect(promiseStatus.fulfilled).toBe(false);
      });

      it("when main resolves with response, resolves with response", async () => {
        await requestListenerInMainMock.resolve("some-response");

        const actual = await actualPromise;

        expect(actual).toBe("some-response");
      });
    });
  });

  describe("when registering multiple handlers for the same channel", () => {
    beforeEach(() => {
      const testChannelListenerInMainInjectable = getRequestChannelListenerInjectable({
        channel: testRequestChannel,
        handler: () => () => "some-value",
      });
      const testChannelListenerInMain2Injectable = getRequestChannelListenerInjectable({
        channel: testRequestChannel,
        handler: () => () => "some-other-value",
      });

      testChannelListenerInMain2Injectable.id += "2";

      builder.beforeApplicationStart((mainDi) => {
        runInAction(() => {
          mainDi.register(testChannelListenerInMainInjectable);
          mainDi.register(testChannelListenerInMain2Injectable);
        });
      });
    });

    it("throws on startup", async () => {
      await expect(builder.render()).rejects.toThrow('Tried to register a multiple channel handlers for "some-request-channel-id", only one handler is supported for a request channel.');
    });
  });
});

const testMessageChannel: TestMessageChannel = {
  id: "some-message-channel-id",
};

const testRequestChannel: TestRequestChannel = {
  id: "some-request-channel-id",
};

