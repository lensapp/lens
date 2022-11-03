/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import topBarStateInjectable from "../../../../../../features/top-bar/common/state.injectable";

const topBarNextEnabledInjectable = getInjectable({
  id: "top-bar-next-enabled",
  instantiate: (di) => {
    const state = di.inject(topBarStateInjectable);

    return computed(() => state.value.get().nextEnabled);
  },
});

export default topBarNextEnabledInjectable;
