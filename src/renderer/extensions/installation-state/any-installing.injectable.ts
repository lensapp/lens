/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import extensionsInstallingInjectable from "./installing.injectable";

const anyExtensionsInstallingInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(extensionsInstallingInjectable);

    return computed(() => state.size > 0);
  },
  lifecycle: lifecycleEnum.singleton,
});

export default anyExtensionsInstallingInjectable;
