/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainerForInjection, Injectable, InjectionToken } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { Runnable } from "../runnable/run-many-for";

export interface CreateInitializableStateArgs<T> {
  id: string;
  init: (di: DiContainerForInjection) => Promise<T> | T;
  injectionToken?: InjectionToken<InitializableState<T>, void>;
  when: InjectionToken<Runnable<void>, void>;
}

export interface InitializableState<T> {
  get: () => T;
}

export type InitializableStateValue<T> =
  | { set: false }
  | { set: true; value: T };

export interface CreateInitializableStateResult<T> {
  value: Injectable<InitializableState<T>, unknown, void>;
  initializer: Injectable<Runnable<void>, Runnable<void>, void>;
}

export function createInitializableState<T>(args: CreateInitializableStateArgs<T>): CreateInitializableStateResult<T> {
  const { id, init, injectionToken, when } = args;

  let box: InitializableStateValue<T> = {
    set: false,
  };
  let initCalled = false;

  const valueInjectable = getInjectable({
    id,
    instantiate: (): InitializableState<T> => ({
      get: () => {
        if (!initCalled) {
          throw new Error(`InitializableState(${id}) has not been initialized yet`);
        }

        if (box.set === false) {
          throw new Error(`InitializableState(${id}) has not finished initializing`);
        }

        return box.value;
      },
    }),
    injectionToken,
  });

  const initializer = getInjectable({
    id: `initialize-${id}`,
    instantiate: (di) => ({
      id: `initialize-${id}`,
      run: async () => {
        if (initCalled) {
          throw new Error(`Cannot initialize InitializableState(${id}) more than once`);
        }

        initCalled = true;
        box = {
          set: true,
          value: await init(di),
        };
      },
    }),
    injectionToken: when,
  });

  return {
    value: valueInjectable,
    initializer,
  };
}
