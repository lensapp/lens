/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainerForInjection, Injectable, InjectionToken } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { Runnable } from "../runnable/run-many-for";
import type { Discriminable } from "../utils/composable-responsibilities/discriminable/discriminable";

export interface CreateInitializableStateArgs<T> {
  id: string;
  init: (di: DiContainerForInjection) => Promise<T> | T;
  injectionToken?: InjectionToken<InitializableState<T>, void>;
  when: InjectionToken<Runnable<void>, void>;
}

const setInitializing = Symbol("set-initializing");
const initialize = Symbol("initialize");

export interface InitializableState<T> {
  get: () => T;
  [setInitializing]: () => void;
  [initialize]: (value: T) => void;
}

export type UnsetValue = Discriminable<"uninitialized">;
export type InitializingValue = Discriminable<"initializing">;
export type InitializedValue<T> = Discriminable<"initialized"> & { value: T };

export type InitializableStateValue<T> =
  | UnsetValue
  | InitializingValue
  | InitializedValue<T>;

export interface CreateInitializableStateResult<T> {
  value: Injectable<InitializableState<T>, unknown, void>;
  initializer: Injectable<Runnable<void>, Runnable<void>, void>;
}

export function createInitializableState<T>(args: CreateInitializableStateArgs<T>): CreateInitializableStateResult<T> {
  const { id, init, injectionToken, when } = args;

  const valueInjectable = getInjectable({
    id,
    instantiate: (): InitializableState<T> => {
      let box: InitializableStateValue<T> = {
        kind: "uninitialized",
      };

      return {
        get: () => {
          if (box.kind !== "initialized") {
            throw new Error(`Cannot get value from "${id}"; it is currently in state=${box.kind}`);
          }

          return box.value;
        },
        [setInitializing]: () => {
          if (box.kind !== "uninitialized") {
            throw new Error(`Cannot start initializing value for "${id}"; it is currently in state=${box.kind}`);
          }

          box = {
            kind: "initializing",
          };
        },
        [initialize]: (value) => {
          if (box.kind !== "initializing") {
            throw new Error(`Cannot initialize value for "${id}"; it is currently in state=${box.kind}`);
          }

          box = {
            kind: "initialized",
            value,
          };
        },
      };
    },
    injectionToken,
  });

  const subId = `initialize id="${id}" during id="${when.id}"`;
  const initializer = getInjectable({
    id: subId,
    instantiate: (di) => ({
      id: subId,
      run: (): void | Promise<void> => {
        const value = di.inject(valueInjectable);

        value[setInitializing]();

        const potentialValue = init(di);

        if (potentialValue instanceof Promise) {
          // This is done because we have to run syncronously if `init` is syncronous to prevent ordering issues
          return potentialValue.then(value[initialize]);
        } else {
          value[initialize](potentialValue);
        }
      },
    }),
    injectionToken: when,
  });

  return {
    value: valueInjectable,
    initializer,
  };
}


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
    instantiate: (): InitializableState<T> => {
      let box: InitializableStateValue<T> = {
        kind: "uninitialized",
      };

      return {
        get: () => {
          if (box.kind !== "initialized") {
            throw new Error(`Cannot get value from "${id}"; it is currently in state=${box.kind}`);
          }

          return box.value;
        },
        [setInitializing]: () => {
          if (box.kind !== "uninitialized") {
            throw new Error(`Cannot start initializing value for "${id}"; it is currently in state=${box.kind}`);
          }

          box = {
            kind: "initializing",
          };
        },
        [initialize]: (value) => {
          if (box.kind !== "initializing") {
            throw new Error(`Cannot initialize value for "${id}"; it is currently in state=${box.kind}`);
          }

          box = {
            kind: "initialized",
            value,
          };
        },
      };
    },
    injectionToken,
  });

  const initializers = initAfter.map(runnableInjectable => {
    const subId = `initialize "${id}" after "${runnableInjectable.id}"`;

    return getInjectable({
      id: subId,
      instantiate: (di) => ({
        id: subId,
        run: (): void | Promise<void> => {
          const value = di.inject(valueInjectable);

          value[setInitializing]();

          const potentialValue = init(di);

          if (potentialValue instanceof Promise) {
            // This is done because we have to run syncronously if `init` is syncronous to prevent ordering issues
            return potentialValue.then(value[initialize]);
          } else {
            value[initialize](potentialValue);
          }
        },
        runAfter: di.inject(runnableInjectable),
      }),
      injectionToken: runnableInjectable.injectionToken,
    });
  });

  return {
    value: valueInjectable,
    initializers,
  };
}
