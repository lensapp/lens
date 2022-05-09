/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import updateIsReadyToBeInstalledInjectableState from "./update-is-ready-to-be-installed-state.injectable";

const updateIsReadyToBeInstalledInjectable = getInjectable({
  id: "update-is-ready-to-be-installed",

  instantiate: (di) => {
    const updateIsReadyToBeInstalledState = di.inject(updateIsReadyToBeInstalledInjectableState);

    return computed(() => updateIsReadyToBeInstalledState.get());
  },
});

export default updateIsReadyToBeInstalledInjectable;
