/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AppPaths } from "./app-path-injection-token";

const appPathsStateInjectable = getInjectable({
  id: "app-paths-state",

  instantiate: () => {
    let state: AppPaths;

    return {
      get: () =>{
        if (!state) {
          throw new Error("Tried to get app paths before state is setupped.");
        }

        return state;
      },

      set: (newState: AppPaths) => {
        if (state) {
          throw new Error("Tried to overwrite existing state of app paths.");
        }

        state = newState;
      },
    };
  },
});

export default appPathsStateInjectable;
