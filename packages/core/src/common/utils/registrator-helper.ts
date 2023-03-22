/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { iter } from "@k8slens/utilities";
import type { DiContainerForInjection, Injectable } from "@ogre-tools/injectable";

// Register new injectables and deregister removed injectables by id

export const injectableDifferencingRegistratorWith = (di: DiContainerForInjection) => (
  (rawCurrent: Injectable<any, any, any>[], rawPrevious: Injectable<any, any, any>[] = []) => {
    const current = new Map(rawCurrent.map(inj => [inj.id, inj]));
    const previous = new Map(rawPrevious.map(inj => [inj.id, inj]));
    const toAdd = iter.chain(current.entries())
      .filter(([id]) => !previous.has(id))
      .collect(entries => new Map(entries));
    const toRemove = iter.chain(previous.entries())
      .filter(([id]) => !current.has(id))
      .collect(entries => new Map(entries));

    di.deregister(...toRemove.values());
    di.register(...toAdd.values());
  }
);
