/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import topBarStateInjectable from "../../../../../../features/top-bar/common/state.injectable";

const topBarPrevEnabledInjectable = getInjectable({
  id: "top-bar-prev-enabled",
  instantiate: (di) => {
    const state = di.inject(topBarStateInjectable);

    return computed(() => state.value.get().prevEnabled);
  },
});

export default topBarPrevEnabledInjectable;
