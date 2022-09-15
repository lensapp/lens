/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainerForInjection, Injectable, InjectionToken } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";

export interface CreateInitializableStateArgs<T> {
  id: string;
  init: (di: DiContainerForInjection) => Promise<T> | T;
  injectionToken?: InjectionToken<InitializableState<T>, void>;
}

export interface InitializableState<T> {
  get: () => T;
  init: () => Promise<void>;
}

type InitializableStateValue<T> =
  | { set: false }
  | { set: true; value: T } ;

export function createInitializableState<T>(args: CreateInitializableStateArgs<T>): Injectable<InitializableState<T>, unknown, void> {
  const { id, init, injectionToken } = args;

  return getInjectable({
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
}
