/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { topBarItemOnLeftSideInjectionToken } from "../../../../../../renderer/components/layout/top-bar/top-bar-items/top-bar-item-injection-token";
import { UpdateButton } from "./update-button";
import updateWarningLevelInjectable from "./update-warning-level.injectable";

const updateApplicationTopBarItemInjectable = getInjectable({
  id: "update-application-top-bar-item",

  instantiate: (di) => {
    const warningLevel = di.inject(updateWarningLevelInjectable);

    return {
      id: "update-application",
      isShown: computed(() => !!warningLevel.get()),
      orderNumber: 50,
      Component: UpdateButton,
    };
  },

  injectionToken: topBarItemOnLeftSideInjectionToken,
});

export default updateApplicationTopBarItemInjectable;
