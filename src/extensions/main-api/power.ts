/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { powerMonitor } from "electron";
import type { Disposer } from "../../common/utils/disposer";
type PowerEventListener = () => void;

export const onSuspend = (listener: PowerEventListener): Disposer => {
  powerMonitor.on("suspend", listener);

  return () => {
    powerMonitor.off("suspend", listener);
  };
};

export const onResume = (listener: PowerEventListener): Disposer => {
  powerMonitor.on("resume", listener);

  return () => {
    powerMonitor.off("resume", listener);
  };
};

export const onShutdown = (listener: PowerEventListener): Disposer => {
  powerMonitor.on("shutdown", listener);

  return () => {
    powerMonitor.off("shutdown", listener);
  };
};
