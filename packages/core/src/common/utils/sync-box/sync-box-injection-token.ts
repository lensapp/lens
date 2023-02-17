/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
export interface SyncBox<Value> {
  readonly id: string;
  readonly value: IComputedValue<Value>;
  set: (value: Value) => void;
}

export const syncBoxInjectionToken = getInjectionToken<SyncBox<any>>({
  id: "sync-box",
});
