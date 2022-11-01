/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainerForInjection, Injectable, InjectionToken } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { Runnable } from "../runnable/run-many-for";
import type { InitializableState, InitializableStateValue } from "./create";

export interface CreateDependentInitializableStateArgs<T> {
  id: string;
  init: (di: DiContainerForInjection) => Promise<T> | T;
  injectionToken?: InjectionToken<InitializableState<T>, void>;
  initAfter: Injectable<Runnable<void>, Runnable<void>, void>[];
}

export interface CreateDependentInitializableStateResult<T> {
  value: Injectable<InitializableState<T>, unknown, void>;
  initializers: Injectable<Runnable<void>, Runnable<void>, void>[];
}

export function createDependentInitializableState<T>(args: CreateDependentInitializableStateArgs<T>): CreateDependentInitializableStateResult<T> {
  const { id, init, injectionToken, initAfter } = args;

  const valueInjectable = getInjectable({
    id,
    instantiate: (di) => {
      let box: InitializableStateValue<T> = {
        set: false,
      };
      let initCalled = false;

      return {
        init: async () => {
          if (initCalled) {
            throw new Error(`Cannot initialize InitializableState(${id}) more than once`);
          }

          initCalled = true;
          box = {
            set: true,
            value: await init(di),
          };
        },
        get: () => {
          if (!initCalled) {
            throw new Error(`InitializableState(${id}) has not been initialized yet`);
          }

          if (box.set === false) {
            throw new Error(`InitializableState(${id}) has not finished initializing`);
          }

          return box.value;
        },
      };
    },
    injectionToken,
  });

  const initializers = initAfter.map(runnableInjectable => getInjectable({
    id: `initialize-${id}`,
    instantiate: (di) => {
      const value = di.inject(valueInjectable);

      return {
        id: `initialize-${id}`,
        run: () => value.init(),
        runAfter: di.inject(runnableInjectable),
      };
    },
    injectionToken: runnableInjectable.injectionToken,
  }));

  return {
    value: valueInjectable,
    initializers,
  };
}
