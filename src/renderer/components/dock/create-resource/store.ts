/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { StorageHelper } from "../../../utils";
import { DockTabStorageState, DockTabStore } from "../dock-tab-store/dock-tab.store";

interface Dependencies {
  createStorage:<T> (storageKey: string, options: DockTabStorageState<T>) => StorageHelper<DockTabStorageState<T>>;
}

export class CreateResourceTabStore extends DockTabStore<string> {
  constructor(protected dependencies: Dependencies) {
    super(dependencies, {
      storageKey: "create_resource",
    });
  }
}
