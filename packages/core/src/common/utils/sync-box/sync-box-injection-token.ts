/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable, InjectionToken } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import createSyncBoxInjectable from "./create-sync-box.injectable";

export interface SyncBox<Value> {
  id: string;
  value: IComputedValue<Value>;
  set: (value: Value) => void;
}

export const syncBoxInjectionToken = getInjectionToken<SyncBox<unknown>>({
  id: "sync-box",
});

export const getSyncBoxInjectable = <T>(id: string, initialValue: T): Injectable<SyncBox<T>, SyncBox<T>, void> => (
  getInjectable({
    id: `sync-box-${id}`,
    instantiate: (di) => {
      const createSyncBox = di.inject(createSyncBoxInjectable);

      return createSyncBox<T>(id, initialValue);
    },
    injectionToken: syncBoxInjectionToken as InjectionToken<SyncBox<T>, void>,
  })
);
