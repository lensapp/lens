/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import type { SendMessageToChannel } from "../../common/utils/channel/message-to-channel-injection-token";
import { sendMessageToChannelInjectionToken } from "../../common/utils/channel/message-to-channel-injection-token";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import rendererLogFileIdInjectable from "./renderer-log-file-id.injectable";
import ipcLogTransportInjectable from "./ipc-transport.injectable";
import { MESSAGE } from "triple-beam";

describe("renderer log transport through ipc", () => {
  let di: DiContainer;
  let sendIpcMock: SendMessageToChannel;

  beforeEach(() => {
    sendIpcMock = jest.fn();
    di = getDiForUnitTesting({ doGeneralOverrides: false });
    di.override(sendMessageToChannelInjectionToken, () => sendIpcMock);
    di.override(rendererLogFileIdInjectable, () => "some-log-id");
  });

  it("send serialized ipc messages on log", () => {
    const logTransport = di.inject(ipcLogTransportInjectable);

    logTransport.log(
      {
        level: "info",
        message: "some log text",
        [MESSAGE]: "actual winston log text",
      },
      () => {},
    );

    expect(sendIpcMock).toHaveBeenCalledWith(
      { id: "ipc-file-logger-channel" },
      {
        entry: {
          level: "info",
          message: "some log text",
          internalMessage: "actual winston log text",
        },
        fileId: "some-log-id",
      },
    );
  });
});
