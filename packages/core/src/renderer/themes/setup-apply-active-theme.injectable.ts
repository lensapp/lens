/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import initializeSystemThemeTypeInjectable from "../../features/theme/system-type/renderer/initialize.injectable";
import { beforeFrameStartsSecondInjectionToken } from "../before-frame-starts/tokens";
import initUserStoreInjectable from "../../features/user-preferences/renderer/load-storage.injectable";
import activeThemeInjectable from "./active.injectable";
import applyLensThemeInjectable from "./apply-lens-theme.injectable";

const setupApplyActiveThemeInjectable = getInjectable({
  id: "setup-apply-active-theme",
  instantiate: (di) => ({
    run: () => {
      const activeTheme = di.inject(activeThemeInjectable);
      const applyLensTheme = di.inject(applyLensThemeInjectable);

      reaction(
        () => activeTheme.get(),
        applyLensTheme,
        {
          fireImmediately: true,
        },
      );
    },
    runAfter: [
      initializeSystemThemeTypeInjectable,
      initUserStoreInjectable,
    ],
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default setupApplyActiveThemeInjectable;
