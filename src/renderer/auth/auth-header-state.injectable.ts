/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const authHeaderValueStateInjectable = getInjectable({
  id: "auth-header-value-state",
  instantiate: () => {
    let state: string | undefined = undefined;

    return {
      get: () =>{
        if (!state) {
          throw new Error("Tried to get auth header value before it was initialized");
        }

        return state;
      },

      set: (newState: string) => {
        if (state) {
          throw new Error("Tried to overwrite existing state of auth header value");
        }

        state = newState;
      },
    };
  },
});

export default authHeaderValueStateInjectable;

