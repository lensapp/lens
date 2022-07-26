/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import type { CreateStorage } from "./create-storage";
import createStorageInjectable from "./create-storage.injectable";

export const controlWhenStoragesAreReady = (di: DiContainer) => {
  const storagesAreReady: Promise<void>[] = [];

  const decorated =
        (toBeDecorated: CreateStorage) =>
          (key: string, defaultValue: any) => {
            const storage = toBeDecorated(key, defaultValue);

            storagesAreReady.push(storage.whenReady);

            return storage;
          };

  // TODO: Remove when typing is added to the library
  (di as any).decorateFunction(createStorageInjectable, decorated);

  return async () => {
    await Promise.all(storagesAreReady);
  };
};
