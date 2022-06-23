/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { LensWindow } from "../../../main/start-main-application/lens-window/application-window/lens-window-injection-token";
import { lensWindowInjectionToken } from "../../../main/start-main-application/lens-window/application-window/lens-window-injection-token";
import type { MessageToChannel } from "./message-to-channel-injection-token";
import { messageToChannelInjectionToken } from "./message-to-channel-injection-token";
import { getApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import createLensWindowInjectable from "../../../main/start-main-application/lens-window/application-window/create-lens-window.injectable";
import closeAllWindowsInjectable from "../../../main/start-main-application/lens-window/hide-all-windows/close-all-windows.injectable";
import { messageChannelListenerInjectionToken } from "./message-channel-listener-injection-token";
import type { MessageChannel } from "./message-channel-injection-token";
import type { RequestFromChannel } from "./request-from-channel-injection-token";
import { requestFromChannelInjectionToken } from "./request-from-channel-injection-token";
import type { RequestChannel } from "./request-channel-injection-token";
import { requestChannelListenerInjectionToken } from "./request-channel-listener-injection-token";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { getPromiseStatus } from "../../test-utils/get-promise-status";

type TestMessageChannel = MessageChannel<string>;
type TestRequestChannel = RequestChannel<string, string>;

describe("channel", () => {
  describe("messaging from main to renderer, given listener for channel in a window and application has started", () => {
    let testMessageChannel: TestMessageChannel;
    let messageListenerInWindowMock: jest.Mock;
    let mainDi: DiContainer;
    let messageToChannel: MessageToChannel;

    beforeEach(async () => {
      const applicationBuilder = getApplicationBuilder();

      mainDi = applicationBuilder.dis.mainDi;
      const rendererDi = applicationBuilder.dis.rendererDi;

      messageListenerInWindowMock = jest.fn();

      const testChannelListenerInTestWindowInjectable = getInjectable({
        id: "test-channel-listener-in-test-window",

        instantiate: (di) => ({
          channel: di.inject(testMessageChannelInjectable),

          handler: messageListenerInWindowMock,
        }),

        injectionToken: messageChannelListenerInjectionToken,
      });

      rendererDi.register(testChannelListenerInTestWindowInjectable);

      // Notice how test channel has presence in both DIs, being from common
      mainDi.register(testMessageChannelInjectable);
      rendererDi.register(testMessageChannelInjectable);

      testMessageChannel = mainDi.inject(testMessageChannelInjectable);

      messageToChannel = mainDi.inject(
        messageToChannelInjectionToken,
      );

      await applicationBuilder.render();

      const closeAllWindows = mainDi.inject(closeAllWindowsInjectable);

      closeAllWindows();
    });

    describe("given window is started", () => {
      let someWindowFake: LensWindow;

      beforeEach(async () => {
        someWindowFake = createTestWindow(mainDi, "some-window");

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
      const someWindowFake = createTestWindow(mainDi, "some-window");
      const someOtherWindowFake = createTestWindow(mainDi, "some-other-window");

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
    let testMessageChannel: TestMessageChannel;
    let messageListenerInMainMock: jest.Mock;
    let rendererDi: DiContainer;
    let mainDi: DiContainer;
    let messageToChannel: MessageToChannel;

    beforeEach(async () => {
      const applicationBuilder = getApplicationBuilder();

      mainDi = applicationBuilder.dis.mainDi;
      rendererDi = applicationBuilder.dis.rendererDi;

      messageListenerInMainMock = jest.fn();

      const testChannelListenerInMainInjectable = getInjectable({
        id: "test-channel-listener-in-main",

        instantiate: (di) => ({
          channel: di.inject(testMessageChannelInjectable),

          handler: messageListenerInMainMock,
        }),

        injectionToken: messageChannelListenerInjectionToken,
      });

      mainDi.register(testChannelListenerInMainInjectable);

      // Notice how test channel has presence in both DIs, being from common
      mainDi.register(testMessageChannelInjectable);
      rendererDi.register(testMessageChannelInjectable);

      testMessageChannel = rendererDi.inject(testMessageChannelInjectable);

      messageToChannel = rendererDi.inject(
        messageToChannelInjectionToken,
      );

      await applicationBuilder.render();
    });

    it("when sending message, triggers listener in main", () => {
      messageToChannel(testMessageChannel, "some-message");

      expect(messageListenerInMainMock).toHaveBeenCalledWith("some-message");
    });
  });

  describe("requesting from main in renderer, given listener for channel in a main and application has started", () => {
    let testRequestChannel: TestRequestChannel;
    let requestListenerInMainMock: AsyncFnMock<(arg: string) => string>;
    let rendererDi: DiContainer;
    let mainDi: DiContainer;
    let requestFromChannel: RequestFromChannel;

    beforeEach(async () => {
      const applicationBuilder = getApplicationBuilder();

      mainDi = applicationBuilder.dis.mainDi;
      rendererDi = applicationBuilder.dis.rendererDi;

      requestListenerInMainMock = asyncFn();

      const testChannelListenerInMainInjectable = getInjectable({
        id: "test-channel-listener-in-main",

        instantiate: (di) => ({
          channel: di.inject(testRequestChannelInjectable),

          handler: requestListenerInMainMock,
        }),

        injectionToken: requestChannelListenerInjectionToken,
      });

      mainDi.register(testChannelListenerInMainInjectable);

      // Notice how test channel has presence in both DIs, being from common
      mainDi.register(testRequestChannelInjectable);
      rendererDi.register(testRequestChannelInjectable);

      testRequestChannel = rendererDi.inject(testRequestChannelInjectable);

      requestFromChannel = rendererDi.inject(
        requestFromChannelInjectionToken,
      );

      await applicationBuilder.render();
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
});

const testMessageChannelInjectable = getInjectable({
  id: "some-message-test-channel",

  instantiate: (): TestMessageChannel => ({
    id: "some-message-channel-id",
  }),
});

const testRequestChannelInjectable = getInjectable({
  id: "some-request-test-channel",

  instantiate: (): TestRequestChannel => ({
    id: "some-request-channel-id",
  }),
});

const createTestWindow = (di: DiContainer, id: string) => {
  const testWindowInjectable = getInjectable({
    id,

    instantiate: (di) => {
      const createLensWindow = di.inject(createLensWindowInjectable);

      return createLensWindow({
        id,
        title: "Some test window",
        defaultHeight: 42,
        defaultWidth: 42,
        getContentSource: () => ({ url: "some-content-url" }),
        resizable: true,
        windowFrameUtilitiesAreShown: false,
        centered: false,
      });
    },

    injectionToken: lensWindowInjectionToken,
  });

  di.register(testWindowInjectable);

  return di.inject(testWindowInjectable);
};
