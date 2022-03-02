/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const userSuppliedValuesAreShownInjectable = getInjectable({
  id: "user-supplied-values-are-shown",

  instantiate: () => {
    const state = observable.box(false);

    return {
      get value() {
        return state.get();
      },

      toggle: () => {
        state.set(!state.get());
      },
    };
  },
});

export default userSuppliedValuesAreShownInjectable;

