/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DockTabStoreDependencies } from "../dock-tab-store/dock-tab.store";
import { DockTabStore } from "../dock-tab-store/dock-tab.store";

export interface CreateResourceTabStoreDependencies extends DockTabStoreDependencies {
}

export class CreateResourceTabStore extends DockTabStore<string> {
  constructor(protected readonly dependencies: CreateResourceTabStoreDependencies) {
    super(dependencies, {
      storageKey: "create_resource",
    });
  }
}
