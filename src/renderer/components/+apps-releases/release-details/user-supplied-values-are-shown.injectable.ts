/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";

const userSuppliedValuesAreShownInjectable = getInjectable({
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

  lifecycle: lifecycleEnum.singleton,
});

export default userSuppliedValuesAreShownInjectable;

