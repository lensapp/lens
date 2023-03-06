import type { LogEntry, transports } from "winston";

type IpcFileLoggerOptions = Omit<transports.FileTransportOptions, "filename">;

class IpcFileLogger {
  private fileTransports = new Map<string, transports.FileTransportInstance>();

  constructor(
    private options: IpcFileLoggerOptions,
    private createNewFileTransport: (
      options: transports.FileTransportOptions
    ) => transports.FileTransportInstance
  ) {}

  log({ fileId, entry }: { fileId: string; entry: LogEntry }) {
    const transport = this.ensureTransportForFile(fileId);

    transport?.log?.(entry, () => {});
  }

  close(fileId: string) {
    const transport = this.fileTransports.get(fileId);
    if (transport) {
      transport.close?.();
      this.fileTransports.delete(fileId);
    }
  }

  closeAll() {
    [...this.fileTransports.keys()].forEach((fileId) => {
      this.close(fileId);
    });
  }

  private ensureTransportForFile(fileId: string) {
    if (this.fileTransports.has(fileId)) {
      return this.fileTransports.get(fileId);
    }

    const fileTransport = this.createNewFileTransport({
      ...this.options,
      filename: `lens-${fileId}.log`,
    });

    this.fileTransports.set(fileId, fileTransport);

    return fileTransport;
  }
}

export default IpcFileLogger;
