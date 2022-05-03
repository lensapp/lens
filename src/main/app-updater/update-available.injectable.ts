/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import appUpdaterStateInjectable from "./state.injectable";

const updateAvailableInjectable = getInjectable({
  id: "update-available",
  instantiate: (di) => {
    const appUpdaterState = di.inject(appUpdaterStateInjectable);

    return computed(() => appUpdaterState.get().status === "update-install-ready");
  },
});

export default updateAvailableInjectable;
