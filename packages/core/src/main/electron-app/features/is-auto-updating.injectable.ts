/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const isAutoUpdatingInjectable = getInjectable({
  id: "is-auto-updating",
  instantiate: () => {
    let value = false;

    return {
      get: () => value,
      setAsUpdating: () => {
        value = true;
      },
    };
  },
});

export default isAutoUpdatingInjectable;
