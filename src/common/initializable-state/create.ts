/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainerForInjection } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";

export interface CreateInitializableStateArgs<T> {
  id: string;
  init: (di: DiContainerForInjection) => Promise<T>;
}

type InitializableStateValue<T> = { set: false } | { set: true; value: T };

export function createInitializableState<T>(args: CreateInitializableStateArgs<T>) {
  const { id, init } = args;

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
            throw new Error(`Cannot initialized AsyncSyncBox ${id}) more than once`);
          }

          initCalled = true;
          box = {
            set: true,
            value: await init(di),
          };
        },
        get: () => {
          if (!initCalled) {
            throw new Error(`AsyncSyncBox(${id}) has not been initialized yet`);
          }

          if (!box.set) {
            throw new Error(`AsyncSyncBox(${id}) has not finished initializing`);
          }

          return box.value;
        },
      };
    },
  });
}
