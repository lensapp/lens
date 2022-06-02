/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import type { JsonValue } from "type-fest";

export interface SyncBox<TValue extends JsonValue> {
  id: string;
  value: IComputedValue<TValue>;
  set: (value: TValue) => void;
}

export const syncBoxInjectionToken = getInjectionToken<SyncBox<any>>({
  id: "sync-box",
});
