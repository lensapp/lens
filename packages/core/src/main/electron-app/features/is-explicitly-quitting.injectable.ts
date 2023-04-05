/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const isExplicitlyQuittingInjectable = getInjectable({
  id: "is-explicitly-quitting",
  instantiate: () => {
    let value = false;

    return {
      get: () => value,
      set: (newValue: boolean) => {
        value = newValue;
      },
    };
  },
});

export default isExplicitlyQuittingInjectable;
