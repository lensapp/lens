/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable, runInAction } from "mobx";
import { getOrInsertMap } from "./collection-functions";
import { noop } from "./noop";

export interface ObservableCrate<T> {
  get(): T;
  set(value: T): void;
}

export interface ObservableCrateFactory {
  <T>(initialValue: T, transitionHandlers?: ObservableCrateTransitionHandlers<T>): ObservableCrate<T>;
}

export interface ObservableCrateTransitionHandler<T> {
  from: T;
  to: T;
  onTransition: () => void;
}
export type ObservableCrateTransitionHandlers<T> = ObservableCrateTransitionHandler<T>[];

function convertToHandlersMap<T>(handlers: ObservableCrateTransitionHandlers<T>): Map<T, Map<T, () => void>> {
  const res: ReturnType<typeof convertToHandlersMap<T>> = new Map();

  for (const { from, to, onTransition } of handlers) {
    getOrInsertMap(res, from).set(to, onTransition);
  }

  return res;
}

export const observableCrate = ((initialValue, transitionHandlers = []) => {
  const crate = observable.box(initialValue);
  const handlers = convertToHandlersMap(transitionHandlers);

  return {
    get() {
      return crate.get();
    },
    set(value) {
      const onTransition = handlers.get(crate.get())?.get(value) ?? noop;

      runInAction(() => {
        crate.set(value);
        onTransition();
      });
    },
  };
}) as ObservableCrateFactory;
