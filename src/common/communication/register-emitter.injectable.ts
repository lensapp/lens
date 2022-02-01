/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { LensLogger } from "../logger";
import broadcastInjectable from "./broadcast.injectable";
import type { EmitterChannel } from "./emitter";

interface Dependencies {
  broadcast: (name: string, ...args: any[]) => void;
}

function registerEmitterChannel({ broadcast }: Dependencies) {
  return function <Parameters extends any[]>(name: string, logger?: LensLogger): EmitterChannel<Parameters> {
    return (...args) => {
      logger?.info(`Broadcasting on ${name}`, { args });
      broadcast(name, ...args);
    };
  };
}

/**
 * This dependency is for registering the source of events
 */
const registerEmitterChannelInjectable = getInjectable({
  instantiate: (di) => registerEmitterChannel({
    broadcast: di.inject(broadcastInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default registerEmitterChannelInjectable;
