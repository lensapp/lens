/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const authHeaderStateInjectable = getInjectable({
  id: "auth-header-state",
  instantiate: () => {
    let header: string;

    return {
      get: () => {
        if (!header) {
          throw new Error("Tried to get auth header value before being set");
        }

        return header;
      },
      set: (value: string) => {
        if (header) {
          throw new Error("Tried to set auth header value more than once");
        }

        header = value;
      },
    };
  },
});

export default authHeaderStateInjectable;
