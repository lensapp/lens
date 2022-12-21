/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import rendererFileLoggerTransportInjectable from "./file-transport.injectable";

const closeRendererLogFileInjectable = getInjectable({
  id: "close-renderer-log-file",
  instantiate: (di) => {
    const fileLoggingTransport = di.inject(rendererFileLoggerTransportInjectable);

    return () => {
      fileLoggingTransport.close?.();
    };
  },
});

export default closeRendererLogFileInjectable;
