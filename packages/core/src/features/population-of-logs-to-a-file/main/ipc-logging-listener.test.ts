/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { MESSAGE } from "triple-beam";
import { deserializeLogFromIpc } from "./ipc-logging-listener.injectable";

describe("Ipc log deserialization", () => {
  it("fills in the unique symbol message property Winston transports use internally", () => {
    const logObject = {
      fileId: "irrelevant",
      entry: {
        level: "irrelevant",
        message: "some public message",
        internalMessage: "some internal message",
        someProperty: "irrelevant",
      },
    };

    expect(deserializeLogFromIpc(logObject)).toEqual({
      entry: {
        level: "irrelevant",
        message: "some public message",
        [MESSAGE]: "some internal message",
        someProperty: "irrelevant",
      },
      fileId: "irrelevant",
    });
  });
});
