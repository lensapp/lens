/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const lensLocalStorageStateInjectable = getInjectable({
  id: "lens-local-storage-state",
  instantiate: () => observable.object({} as Record<string, unknown>),
});

export default lensLocalStorageStateInjectable;
