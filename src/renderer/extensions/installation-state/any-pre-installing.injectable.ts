/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import extensionsPreInstallingInjectable from "./pre-installing.injectable";

const anyExtensionsPreInstallingInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(extensionsPreInstallingInjectable);

    return computed(() => state.size > 0);
  },
  lifecycle: lifecycleEnum.singleton,
});

export default anyExtensionsPreInstallingInjectable;
