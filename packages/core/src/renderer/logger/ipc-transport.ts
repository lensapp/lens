import type { LogEntry } from "winston";
import TransportStream, { TransportStreamOptions } from "winston-transport";

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
