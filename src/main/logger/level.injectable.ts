/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import isDebuggingInjectable from "../../common/vars/is-debugging.injectable";

export type LogLevel = "silly" | "debug" | "info" | "warn" | "error";

const logLevelInjectable = getInjectable({
  id: "log-level",
  instantiate: (di): LogLevel => {
    const isDebugging = di.inject(isDebuggingInjectable);
    const baseLevel = process.env.LOG_LEVEL?.toLowerCase();

    switch (baseLevel) {
      case "silly":
      case "debug":
      case "info":
      case "warn":
      case "error":
        return baseLevel;
      default:
        return isDebugging ? "debug" : "info";
    }
  },
  causesSideEffects: true,
});

export default logLevelInjectable;
