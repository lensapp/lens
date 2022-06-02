/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { MessageToChannel } from "../../../common/utils/channel/message-to-channel-injection-token";
import { messageToChannelInjectionToken } from "../../../common/utils/channel/message-to-channel-injection-token";
import closeAllWindowsInjectable from "../../start-main-application/lens-window/hide-all-windows/close-all-windows.injectable";
import type { MessageChannel } from "../../../common/utils/channel/message-channel-injection-token";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import createLensWindowInjectable from "../../start-main-application/lens-window/application-window/create-lens-window.injectable";
import type { LensWindow } from "../../start-main-application/lens-window/application-window/lens-window-injection-token";
import { lensWindowInjectionToken } from "../../start-main-application/lens-window/application-window/lens-window-injection-token";
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import sendToChannelInElectronBrowserWindowInjectable from "../../start-main-application/lens-window/application-window/send-to-channel-in-electron-browser-window.injectable";

describe("message to channel from main", () => {
  let messageToChannel: MessageToChannel;
  let someTestWindow: LensWindow;
  let someOtherTestWindow: LensWindow;
  let sendToChannelInBrowserMock: jest.Mock;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    sendToChannelInBrowserMock = jest.fn();
    di.override(sendToChannelInElectronBrowserWindowInjectable, () => sendToChannelInBrowserMock);

    someTestWindow = createTestWindow(di, "some-test-window-id");
    someOtherTestWindow = createTestWindow(di, "some-other-test-window-id");

    messageToChannel = di.inject(messageToChannelInjectionToken);

    const closeAllWindows = di.inject(closeAllWindowsInjectable);

    closeAllWindows();
  });

  it("given no visible windows, when messaging to channel, does not message to any window", () => {
    messageToChannel(someChannel, "some-message");

    expect(sendToChannelInBrowserMock).not.toHaveBeenCalled();
  });

  describe("given visible window", () => {
    beforeEach(async () => {
      await someTestWindow.show();
    });

    it("when messaging to channel, messages to window", () => {
      messageToChannel(someChannel, "some-message");

      expect(sendToChannelInBrowserMock.mock.calls).toEqual([
        [
          null,

          {
            channel: "some-channel",
            data: ['"some-message"'],
          },
        ],
      ]);
    });

    it("given boolean as message, when messaging to channel, messages to window with stringified message", () => {
      messageToChannel(someChannel, true);

      expect(sendToChannelInBrowserMock.mock.calls).toEqual([
        [
          null,

          {
            channel: "some-channel",
            data: ["true"],
          },
        ],
      ]);
    });

    it("given number as message, when messaging to channel, messages to window with stringified message", () => {
      messageToChannel(someChannel, 42);

      expect(sendToChannelInBrowserMock.mock.calls).toEqual([
        [
          null,

          {
            channel: "some-channel",
            data: ["42"],
          },
        ],
      ]);
    });

    it("given object as message, when messaging to channel, messages to window with stringified message", () => {
      messageToChannel(someChannel, { some: "object" });

      expect(sendToChannelInBrowserMock.mock.calls).toEqual([
        [
          null,

          {
            channel: "some-channel",
            data: [JSON.stringify({ some: "object" })],
          },
        ],
      ]);
    });
  });

  it("given multiple visible windows, when messaging to channel, messages to window", async () => {
    await someTestWindow.show();
    await someOtherTestWindow.show();

    messageToChannel(someChannel, "some-message");

    expect(sendToChannelInBrowserMock.mock.calls).toEqual([
      [
        null,

        {
          channel: "some-channel",
          data: ['"some-message"'],
        },
      ],

      [
        null,

        {
          channel: "some-channel",
          data: ['"some-message"'],
        },
      ],
    ]);
  });
});

const someChannel: MessageChannel<any> = { id: "some-channel" };

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
