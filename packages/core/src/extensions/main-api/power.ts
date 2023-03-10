/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { powerMonitor } from "electron";
import type { Disposer } from "@k8slens/utilities";

/**
 * Event listener for system power events
 */
export type PowerEventListener = () => void;

/**
 * Adds event listener to system suspend events
 * @param listener function which will be called on system suspend
 * @returns function to remove event listener
 */
export const onSuspend = (listener: PowerEventListener): Disposer => {
  powerMonitor.on("suspend", listener);

  return () => {
    powerMonitor.off("suspend", listener);
  };
};

/**
 * Adds event listener to system resume event
 * @param listener function which will be called on system resume
 * @returns function to remove event listener
 */
export const onResume = (listener: PowerEventListener): Disposer => {
  powerMonitor.on("resume", listener);

  return () => {
    powerMonitor.off("resume", listener);
  };
};

/**
 * Adds event listener to the event which is emitted when
 * the system is about to reboot or shut down
 * @param listener function which will be called on system shutdown
 * @returns function to remove event listener
 */
export const onShutdown = (listener: PowerEventListener): Disposer => {
  powerMonitor.on("shutdown", listener);

  return () => {
    powerMonitor.off("shutdown", listener);
  };
};
