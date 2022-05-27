/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import appUpdateWarningInjectable from "./app-update-warning.injectable";

const appUpdateWarningLevelInjectable = getInjectable({
  id: "app-update-warning-level",

  instantiate: (di) => {
    const store = di.inject(appUpdateWarningInjectable);

    return computed(() => store.warningLevel);
  },
});

export default appUpdateWarningLevelInjectable;
