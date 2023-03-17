/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import userPreferencesStateInjectable from "./state.injectable";

const httpsProxyConfigurationInjectable = getInjectable({
  id: "https-proxy-configuration",
  instantiate: (di) => {
    const userStore = di.inject(userPreferencesStateInjectable);

    return computed(() => userStore.httpsProxy);
  },
});

export default httpsProxyConfigurationInjectable;
