/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getOrInsertWith } from "@k8slens/utilities";
import type { LogEntry, transports } from "winston";
import createIpcFileLoggerTransportInjectable from "./create-ipc-file-transport.injectable";

export interface IpcFileLogger {
  log: (fileLog: { fileId: string; entry: LogEntry }) => void;
  close: (fileId: string) => void;
  closeAll: () => void;
}

const ipcFileLoggerInjectable = getInjectable({
  id: "ipc-file-logger",
  instantiate: (di): IpcFileLogger => {
    const createIpcFileTransport = di.inject(createIpcFileLoggerTransportInjectable);
    const fileTransports = new Map<string, transports.FileTransportInstance>();

    function log({ fileId, entry }: { fileId: string; entry: LogEntry }) {
      const transport = getOrInsertWith(
        fileTransports,
        fileId,
        () => createIpcFileTransport(fileId),
      );

      transport?.log?.(entry, () => {});
    }

    function close(fileId: string) {
      const transport = fileTransports.get(fileId);

      if (transport) {
        transport.close?.();
        fileTransports.delete(fileId);
      }
    }

    function closeAll() {
      for (const fileId of fileTransports.keys()) {
        close(fileId);
      }
    }

    return {
      log,
      close,
      closeAll,
    };
  },
});

export default ipcFileLoggerInjectable;
