/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { MessageToChannel } from "../../../common/utils/channel/message-to-channel-injection-token";
import type { MessageChannel } from "../../../common/utils/channel/message-channel-injection-token";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import { messageToChannelInjectionToken } from "../../../common/utils/channel/message-to-channel-injection-token";
import ipcRendererInjectable from "./ipc-renderer.injectable";
import type { IpcRenderer } from "electron";

describe("message to channel from renderer", () => {
  let messageToChannel: MessageToChannel;
  let sendMock: jest.Mock;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    sendMock = jest.fn();

    di.override(ipcRendererInjectable, () => ({
      send: sendMock,
    }) as unknown as IpcRenderer);

    messageToChannel = di.inject(messageToChannelInjectionToken);
  });

  it("given string as message, when messaging to channel, sends stringified message", () => {
    messageToChannel(someChannel, "some-message");

    expect(sendMock).toHaveBeenCalledWith("some-channel-id", '"some-message"');
  });

  it("given boolean as message, when messaging to channel, sends stringified message", () => {
    messageToChannel(someChannel, true);

    expect(sendMock).toHaveBeenCalledWith("some-channel-id", "true");
  });

  it("given number as message, when messaging to channel, sends stringified message", () => {
    messageToChannel(someChannel, 42);

    expect(sendMock).toHaveBeenCalledWith("some-channel-id", "42");
  });

  it("given object as message, when messaging to channel, sends stringified message", () => {
    messageToChannel(someChannel, { some: "object" });

    expect(sendMock).toHaveBeenCalledWith(
      "some-channel-id",
      JSON.stringify({ some: "object" }),
    );
  });
});

const someChannel: MessageChannel<any> = { id: "some-channel-id" };
