/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { MessageToChannel } from "../../../common/utils/channel/message-to-channel-injection-token";
import { messageToChannelInjectionToken } from "../../../common/utils/channel/message-to-channel-injection-token";
import type { MessageChannel } from "../../../common/utils/channel/message-channel-injection-token";
import type { LensWindow } from "../../start-main-application/lens-window/application-window/create-lens-window.injectable";
import sendToChannelInElectronBrowserWindowInjectable from "../../start-main-application/lens-window/application-window/send-to-channel-in-electron-browser-window.injectable";
import { getApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";

describe("message to channel from main", () => {
  let messageToChannel: MessageToChannel;
  let someTestWindow: LensWindow;
  let someOtherTestWindow: LensWindow;
  let sendToChannelInBrowserMock: jest.Mock;

  beforeEach(async () => {
    const builder = getApplicationBuilder();

    sendToChannelInBrowserMock = jest.fn();

    builder.beforeApplicationStart(mainDi => {
      mainDi.override(sendToChannelInElectronBrowserWindowInjectable, () => sendToChannelInBrowserMock);
    });

    await builder.startHidden();

    someTestWindow = builder.applicationWindow.create("some-test-window-id");
    someOtherTestWindow = builder.applicationWindow.create("some-other-test-window-id");

    messageToChannel = builder.mainDi.inject(messageToChannelInjectionToken);
  });

  it("given no visible windows, when messaging to channel, does not message to any window", () => {
    messageToChannel(someChannel, "some-message");

    expect(sendToChannelInBrowserMock).not.toHaveBeenCalled();
  });

  describe("given started window", () => {
    beforeEach(async () => {
      await someTestWindow.start();
    });

    it("when messaging to channel, messages to window", () => {
      messageToChannel(someChannel, "some-message");

      expect(sendToChannelInBrowserMock.mock.calls).toEqual([
        [
          "some-test-window-id",

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
          "some-test-window-id",

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
          "some-test-window-id",

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
          "some-test-window-id",

          null,

          {
            channel: "some-channel",
            data: [JSON.stringify({ some: "object" })],
          },
        ],
      ]);
    });
  });

  it("given multiple started windows, when messaging to channel, messages to window", async () => {
    await someTestWindow.start();
    await someOtherTestWindow.start();

    messageToChannel(someChannel, "some-message");

    expect(sendToChannelInBrowserMock.mock.calls).toEqual([
      [
        "some-test-window-id",

        null,

        {
          channel: "some-channel",
          data: ['"some-message"'],
        },
      ],

      [
        "some-other-test-window-id",

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
