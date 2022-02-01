/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import anyExtensionsInstallingInjectable from "./any-installing.injectable";
import anyExtensionsPreInstallingInjectable from "./any-pre-installing.injectable";
import anyExtensionsUninstallingInjectable from "./any-uninstalling.injectable";

const currentlyIdleInjectable = getInjectable({
  instantiate: (di) => {
    const anyInstalling = di.inject(anyExtensionsInstallingInjectable);
    const anyPreinstalling = di.inject(anyExtensionsPreInstallingInjectable);
    const anyUninstalling = di.inject(anyExtensionsUninstallingInjectable);

    return computed(() => (
      anyInstalling.get()
      || anyPreinstalling.get()
      || anyUninstalling.get()
    ));
  },
  lifecycle: lifecycleEnum.singleton,
});

export default currentlyIdleInjectable;
