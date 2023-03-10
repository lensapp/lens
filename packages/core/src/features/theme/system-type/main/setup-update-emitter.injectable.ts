/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import { onLoadOfApplicationInjectionToken } from "@k8slens/application";
import operatingSystemThemeInjectable from "../../../../main/theme/operating-system-theme.injectable";
import emitSystemThemeTypeUpdateInjectable from "./emit-update.injectable";

const setupSystemThemeTypeUpdaterEmitterInjectable = getInjectable({
  id: "setup-system-theme-type-updater-emitter",
  instantiate: (di) => ({
    run: () => {
      const operatingSystemTheme = di.inject(operatingSystemThemeInjectable);
      const emitSystemThemeTypeUpdate = di.inject(emitSystemThemeTypeUpdateInjectable);

      reaction(
        () => operatingSystemTheme.get(),
        emitSystemThemeTypeUpdate,
        {
          fireImmediately: true,
        },
      );
    },
  }),
  injectionToken: onLoadOfApplicationInjectionToken,
});

export default setupSystemThemeTypeUpdaterEmitterInjectable;
