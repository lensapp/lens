/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainerForInjection, Injectable } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { InitializableStateValue } from "./create";

export interface CreateLazyInitializableStateArgs<T> {
  id: string;
  init: (di: DiContainerForInjection) => T;
}

export interface LazyInitializableState<T> {
  get: () => T;
}

export function createLazyInitializableState<T>(args: CreateLazyInitializableStateArgs<T>): Injectable<LazyInitializableState<T>, unknown, void> {
  const { id, init } = args;

  return getInjectable({
    id,
    instantiate: (di): LazyInitializableState<T> => {
      let box: InitializableStateValue<T> = {
        set: false,
      };

      return {
        get: () => {
          if (box.set === false) {
            box = {
              set: true,
              value: init(di),
            };
          }

          return box.value;
        },
      };
    },
  });
}
