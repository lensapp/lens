/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";

type AsJson<T> = T extends string | number | boolean | null
  ? T
  : T extends Function
    ? never
    : T extends Array<infer V>
      ? AsJson<V>[]
      : T extends object
        ? { [K in keyof T]: AsJson<T[K]> }
        : never;

export interface SyncBox<TValue> {
  id: string;
  value: IComputedValue<AsJson<TValue>>;
  set: (value: AsJson<TValue>) => void;
}

export const syncBoxInjectionToken = getInjectionToken<SyncBox<any>>({
  id: "sync-box",
});
