/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { LogEntry } from "winston";
import type { TransportStreamOptions } from "winston-transport";
import TransportStream from "winston-transport";

interface IpcLogTransportOptions extends TransportStreamOptions {
  sendIpcLogMessage: (entry: LogEntry) => void;
  closeIpcLogging: () => void;
}

class IpcLogTransport extends TransportStream {
  sendIpcLogMessage: (entry: LogEntry) => void;
  closeIpcLogging: () => void;
  name = "ipc-renderer-transport";

  constructor(options: IpcLogTransportOptions) {
    const { sendIpcLogMessage, closeIpcLogging, ...winstonOptions } = options;

    super(winstonOptions);

    this.sendIpcLogMessage = sendIpcLogMessage;
    this.closeIpcLogging = closeIpcLogging;
  }

  log(logEntry: LogEntry, next: () => void) {
    setImmediate(() => {
      this.emit("logged", logEntry);
    });
    this.sendIpcLogMessage(logEntry);
    next();
  }

  close() {
    this.closeIpcLogging();
  }
}

export default IpcLogTransport;
