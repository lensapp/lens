/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IComputedValue } from "mobx";
import { runInAction, when } from "mobx";
import type { Disposer } from "./disposer";

export async function waitUntilDefined<T>(getter: (() => T | null | undefined) | IComputedValue<T | null | undefined>, opts?: { timeout?: number }): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    when(
      () => {
        const res = typeof getter === "function"
          ? getter()
          : getter.get();
        const isDefined = res != null;

        if (isDefined) {
          resolve(res);
        }

        return isDefined;
      },
      () => {},
      {
        onError: reject,
        ...(opts ?? {}),
      },
    );
  });
}

export function onceDefined<T>(getter: () => T | null | undefined, action: (val: T) => void): Disposer {
  let res: T | null | undefined;

  return when(
    () => {
      res = getter();

      if (res != null) {
        const r = res;

        runInAction(() => {
          action(r);
        });

        return true;
      }

      return false;
    },
    () => {},
  );
}
