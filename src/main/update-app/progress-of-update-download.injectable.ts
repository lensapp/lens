/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action, computed, observable } from "mobx";

const progressOfUpdateDownloadInjectable = getInjectable({
  id: "progress-of-update-download",

  instantiate: () => {
    const state = observable.box(0);

    return {
      value: computed(() => state.get()),

      setValue: action((percentage: number) => {
        state.set(percentage);
      }),
    };
  },
});

export default progressOfUpdateDownloadInjectable;
