/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue, ObservableMap } from "mobx";
import { runInAction, computed } from "mobx";
import childLoggersDebugStateInjectable from "./child-loggers-state.injectable";

export type ClaimChildLogger = (prefix: string) => IComputedValue<boolean>;

interface Dependencies {
  state: ObservableMap<string, boolean>;
}

const claimChildLogger = ({ state }: Dependencies): ClaimChildLogger => (
  (prefix) => {
    if (state.has(prefix)) {
      throw new Error(`Child logging prefix "${prefix}" has already been claimed`);
    }

    runInAction(() => {
      state.set(prefix, false);
    });

    return computed(() => state.get(prefix));
  }
);

const claimChildLoggerInjectable = getInjectable({
  id: "claim-child-logger",
  instantiate: (di) => claimChildLogger({
    state: di.inject(childLoggersDebugStateInjectable),
  }),
});

export default claimChildLoggerInjectable;
