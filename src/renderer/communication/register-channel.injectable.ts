/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import ipcInvokeInjectable from "./ipc-invoke.injectable";
import type { Channel } from "../../common/communication/channel";

interface Dependencies {
  invoke: (channel: string, ...args: any[]) => any;
}

function registerChannel({ invoke }: Dependencies) {
  return function <Parameters extends any[], Value>(name: string): Channel<Parameters, Value> {
    return (...args: Parameters) => invoke(name, ...args);
  };
}

const registerChannelInjectable = getInjectable({
  instantiate: (di) => registerChannel({
    invoke: di.inject(ipcInvokeInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default registerChannelInjectable;
