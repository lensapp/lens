/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import extensionsUninstallingInjectable from "./uninstalling.injectable";

const isUninstallingInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(extensionsUninstallingInjectable);

    return (extId: string) => state.has(extId);
  },
  lifecycle: lifecycleEnum.singleton,
});

export default isUninstallingInjectable;
