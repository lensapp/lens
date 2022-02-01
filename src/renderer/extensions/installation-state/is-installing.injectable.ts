/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import extensionsInstallingInjectable from "./installing.injectable";

const isInstallingInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(extensionsInstallingInjectable);

    return (extId: string) => state.has(extId);
  },
  lifecycle: lifecycleEnum.singleton,
});

export default isInstallingInjectable;
