/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { transports } from "winston";
import { getGlobalOverride } from "@k8slens/test-utils";
import { noop } from "@k8slens/utilities";
import createIpcFileLoggerTranportInjectable from "./create-ipc-file-transport.injectable";

export default getGlobalOverride(
  createIpcFileLoggerTranportInjectable,
  () => () =>
    ({
      log: noop,
      close: noop,
    } as typeof transports.File),
);
