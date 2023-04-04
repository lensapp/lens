/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { MESSAGE } from "triple-beam";
import type { SendMessageToChannel } from "@k8slens/messaging";
import { sendMessageToChannelInjectionToken } from "@k8slens/messaging";
import rendererLogFileIdInjectable from "./renderer-log-file-id.injectable";
import ipcLogTransportInjectable from "./ipc-transport.injectable";
import { getDiForUnitTesting } from "../../../renderer/getDiForUnitTesting";

describe("renderer log transport through ipc", () => {
  let di: DiContainer;
  let sendIpcMock: SendMessageToChannel;

  beforeEach(() => {
    sendIpcMock = jest.fn();
    di = getDiForUnitTesting();
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
