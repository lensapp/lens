/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getDiForUnitTesting } from "../../../main/getDiForUnitTesting";
import createIpcFileLoggerTransportInjectable from "./create-ipc-file-transport.injectable";
import type { IpcFileLogger } from "./ipc-file-logger.injectable";
import ipcFileLoggerInjectable from "./ipc-file-logger.injectable";

describe("ipc file logger in main", () => {
  let logMock: jest.Mock;
  let closeMock: jest.Mock;
  let createFileTransportMock: jest.Mock;
  let logger: IpcFileLogger;

  beforeEach(() => {
    logMock = jest.fn();
    closeMock = jest.fn();
    createFileTransportMock = jest.fn(() => ({
      log: logMock,
      close: closeMock,
    }));

    const di = getDiForUnitTesting();

    di.override(createIpcFileLoggerTransportInjectable, () => createFileTransportMock);
    logger = di.inject(ipcFileLoggerInjectable);
  });

  it("creates a transport for new log file", () => {
    logger.log({
      fileId: "some-log-file",
      entry: { level: "irrelevant", message: "irrelevant" },
    });

    expect(createFileTransportMock).toHaveBeenCalledWith("some-log-file");
  });

  it("uses existing transport for log file", () => {
    logger.log({
      fileId: "some-log-file",
      entry: { level: "irrelevant", message: "irrelevant" },
    });

    logger.log({
      fileId: "some-log-file",
      entry: { level: "irrelevant", message: "irrelevant" },
    });

    logger.log({
      fileId: "some-log-file",
      entry: { level: "irrelevant", message: "irrelevant" },
    });

    expect(createFileTransportMock).toHaveBeenCalledTimes(1);

    expect(createFileTransportMock).toHaveBeenCalledWith("some-log-file");
  });

  it("creates separate transport for each log file", () => {
    logger.log({
      fileId: "some-log-file",
      entry: { level: "irrelevant", message: "irrelevant" },
    });

    logger.log({
      fileId: "some-other-log-file",
      entry: { level: "irrelevant", message: "irrelevant" },
    });

    logger.log({
      fileId: "some-yet-another-log-file",
      entry: { level: "irrelevant", message: "irrelevant" },
    });

    expect(createFileTransportMock).toHaveBeenCalledTimes(3);

    expect(createFileTransportMock).toHaveBeenCalledWith("some-log-file");

    expect(createFileTransportMock).toHaveBeenCalledWith("some-other-log-file");

    expect(createFileTransportMock).toHaveBeenCalledWith("some-yet-another-log-file");
  });

  it("logs using file transport", () => {
    logger.log({
      fileId: "some-log-file",
      entry: { level: "irrelevant", message: "some-log-message" },
    });
    expect(logMock.mock.calls[0][0]).toEqual({
      level: "irrelevant",
      message: "some-log-message",
    });
  });

  it("logs to correct files", () => {
    const someLogMock = jest.fn();
    const someOthertLogMock = jest.fn();

    createFileTransportMock.mockImplementation((fileId: string) => {
      if (fileId === "some-log-file") {
        return { log: someLogMock };
      }

      if (fileId === "some-other-log-file") {
        return { log: someOthertLogMock };
      }

      return null;
    });

    logger.log({
      fileId: "some-log-file",
      entry: { level: "irrelevant", message: "some-log-message" },
    });
    logger.log({
      fileId: "some-other-log-file",
      entry: { level: "irrelevant", message: "some-other-log-message" },
    });

    expect(someLogMock).toHaveBeenCalledTimes(1);
    expect(someLogMock.mock.calls[0][0]).toEqual({
      level: "irrelevant",
      message: "some-log-message",
    });
    expect(someOthertLogMock).toHaveBeenCalledTimes(1);
    expect(someOthertLogMock.mock.calls[0][0]).toEqual({
      level: "irrelevant",
      message: "some-other-log-message",
    });
  });

  it("closes transport (to ensure no file handles are left open)", () => {
    logger.log({
      fileId: "some-log-file",
      entry: { level: "irrelevant", message: "irrelevant" },
    });

    logger.close("some-log-file");

    expect(closeMock).toHaveBeenCalled();
  });

  it("creates a new transport once needed after closing previous", () => {
    logger.log({
      fileId: "some-log-file",
      entry: { level: "irrelevant", message: "irrelevant" },
    });

    logger.close("some-log-file");

    logger.log({
      fileId: "some-log-file",
      entry: { level: "irrelevant", message: "irrelevant" },
    });

    expect(createFileTransportMock).toHaveBeenCalledTimes(2);
    expect(logMock).toHaveBeenCalledTimes(2);
  });
});
