/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import type { AppPaths } from "./app-path-injection-token";

const appPathsStateInjectable = getInjectable({
  id: "app-paths-state",

  instantiate: () => {
    let state: AppPaths | undefined;

    return {
      get: () =>{
        assert(state, "Tried to get app paths before initialization");

        return state;
      },

      set: (newState: AppPaths) => {
        assert(!state, "Tried to overwrite existing state of app paths");

        state = newState;
      },
    };
  },
});

export default appPathsStateInjectable;
