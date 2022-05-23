/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { LensWindow } from "../../main/start-main-application/lens-window/application-window/lens-window-injection-token";
import { lensWindowInjectionToken } from "../../main/start-main-application/lens-window/application-window/lens-window-injection-token";
import type { SendToChannel } from "./send-to-channel-injection-token";
import { sendToChannelInjectionToken } from "./send-to-channel-injection-token";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { channelListenerInjectionToken } from "./channel-listener-injection-token";
import createLensWindowInjectable from "../../main/start-main-application/lens-window/application-window/create-lens-window.injectable";
import type { Channel } from "./channel-injection-token";
import closeAllWindowsInjectable from "../../main/start-main-application/lens-window/hide-all-windows/close-all-windows.injectable";

type TestChannel = Channel<string>;

describe("channel", () => {
  describe("messaging from main to renderer, given listener for channel in a window and application has started", () => {
    let testChannel: TestChannel;
    let testListenerInWindowMock: jest.Mock;
    let mainDi: DiContainer;
    let sendToChannel: SendToChannel;

    beforeEach(async () => {
      const applicationBuilder = getApplicationBuilder();

      mainDi = applicationBuilder.dis.mainDi;
      const rendererDi = applicationBuilder.dis.rendererDi;

      testListenerInWindowMock = jest.fn();

      const testChannelListenerInTestWindowInjectable = getInjectable({
        id: "test-channel-listener-in-test-window",

        instantiate: (di) => ({
          channel: di.inject(testChannelInjectable),

          handler: testListenerInWindowMock,
        }),

        injectionToken: channelListenerInjectionToken,
      });

      rendererDi.register(testChannelListenerInTestWindowInjectable);

      // Notice how test channel has presence in both DIs, being from common
      mainDi.register(testChannelInjectable);
      rendererDi.register(testChannelInjectable);

      testChannel = mainDi.inject(testChannelInjectable);

      sendToChannel = mainDi.inject(
        sendToChannelInjectionToken,
      );

      await applicationBuilder.render();

      const closeAllWindows = mainDi.inject(closeAllWindowsInjectable);

      closeAllWindows();
    });

    describe("given window is shown", () => {
      let someWindowFake: LensWindow;

      beforeEach(async () => {
        someWindowFake = createTestWindow(mainDi, "some-window");

        await someWindowFake.show();
      });

      it("when sending message, triggers listener in window", () => {
        sendToChannel(testChannel, "some-message");

        expect(testListenerInWindowMock).toHaveBeenCalledWith("some-message");
      });

      it("given window is hidden, when sending message, does not trigger listener in window", () => {
        someWindowFake.close();

        sendToChannel(testChannel, "some-message");

        expect(testListenerInWindowMock).not.toHaveBeenCalled();
      });
    });

    it("given multiple shown windows, when sending message, triggers listeners in all windows", async () => {
      const someWindowFake = createTestWindow(mainDi, "some-window");
      const someOtherWindowFake = createTestWindow(mainDi, "some-other-window");

      await someWindowFake.show();
      await someOtherWindowFake.show();

      sendToChannel(testChannel, "some-message");

      expect(testListenerInWindowMock.mock.calls).toEqual([
        ["some-message"],
        ["some-message"],
      ]);
    });
  });

  describe("messaging from renderer to main, given listener for channel in a main and application has started", () => {
    let testChannel: TestChannel;
    let testListenerInMainMock: jest.Mock;
    let rendererDi: DiContainer;
    let mainDi: DiContainer;
    let sendToChannel: SendToChannel;

    beforeEach(async () => {
      const applicationBuilder = getApplicationBuilder();

      mainDi = applicationBuilder.dis.mainDi;
      rendererDi = applicationBuilder.dis.rendererDi;

      testListenerInMainMock = jest.fn();

      const testChannelListenerInMainInjectable = getInjectable({
        id: "test-channel-listener-in-main",

        instantiate: (di) => ({
          channel: di.inject(testChannelInjectable),

          handler: testListenerInMainMock,
        }),

        injectionToken: channelListenerInjectionToken,
      });

      mainDi.register(testChannelListenerInMainInjectable);

      // Notice how test channel has presence in both DIs, being from common
      mainDi.register(testChannelInjectable);
      rendererDi.register(testChannelInjectable);

      testChannel = rendererDi.inject(testChannelInjectable);

      sendToChannel = rendererDi.inject(
        sendToChannelInjectionToken,
      );

      await applicationBuilder.render();
    });

    it("when sending message, triggers listener in main", () => {
      sendToChannel(testChannel, "some-message");

      expect(testListenerInMainMock).toHaveBeenCalledWith("some-message");
    });
  });
});

const testChannelInjectable = getInjectable({
  id: "some-test-channel",

  instantiate: () => {
    const channelId = "some-channel-id";

    return {
      id: channelId,
    };
  },
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
        getContentUrl: () => "some-content-url",
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
