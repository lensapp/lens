/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IpcMainInvokeEvent } from "electron";
import type { Channel } from "../../common/communication/channel";
import ipcHandleInjectable from "./ipc-handle.injectable";

interface Dependencies {
  handle: (channel: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => void) => void;
}

function registerChannel({ handle }: Dependencies) {
  return function <Parameters extends any[], Value>(name: string, getValue: (...args: Parameters) => Value): Channel<Parameters, Value> {
    handle(name, async (event, ...args: Parameters) => await getValue(...args));

    return () => {
      throw new Error(`Invoking channel ${name} on main is invalid`);
    };
  };
}

const registerChannelInjectable = getInjectable({
  instantiate: (di) => registerChannel({
    handle: di.inject(ipcHandleInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default registerChannelInjectable;
