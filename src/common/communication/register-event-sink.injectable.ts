/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { EmitterChannel } from "../../common/communication/emitter";
import type { LensLogger } from "../../common/logger";
import { ipcOnEventInjectionToken } from "./ipc-on-event-injection-token";

interface Depencencies {
  onEvent: (channel: string, ...args: any[]) => void;
}

const registerEventSink = ({ onEvent }: Depencencies) => (
  function <Parameters extends any[]>(name: string, listener: (...args: Parameters) => void, logger?: LensLogger): EmitterChannel<Parameters> {
    onEvent(name, (...args: Parameters) => {
      logger?.info(`Received event on ${name}`, { args });
      listener(...args);
    });

    return listener;
  }
);

const registerEventSinkInjectable = getInjectable({
  instantiate: (di) => registerEventSink({
    onEvent: di.inject(ipcOnEventInjectionToken),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default registerEventSinkInjectable;
