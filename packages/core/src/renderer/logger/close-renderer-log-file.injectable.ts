/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import winstonLoggerInjectable from "../../common/winston-logger.injectable";
import rendererFileLoggerTransportInjectable from "./file-transport.injectable";

const closeRendererLogFileInjectable = getInjectable({
  id: "close-renderer-log-file",
  instantiate: (di) => {
    const winstonLogger = di.inject(winstonLoggerInjectable);
    const fileLoggingTransport = di.inject(rendererFileLoggerTransportInjectable);

    return () => {
      fileLoggingTransport.close?.();
      winstonLogger.remove(fileLoggingTransport);
    };
  },
});

export default closeRendererLogFileInjectable;
