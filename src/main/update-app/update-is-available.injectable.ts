/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import updateIsAvailableStateInjectable from "./update-is-available-state.injectable";

const updateIsAvailableInjectable = getInjectable({
  id: "update-is-available",

  instantiate: (di) => {
    const updateIsAvailableState = di.inject(updateIsAvailableStateInjectable);

    return computed(() => updateIsAvailableState.get());
  },
});

export default updateIsAvailableInjectable;
