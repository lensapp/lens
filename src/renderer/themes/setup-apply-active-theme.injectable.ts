/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import initializeSystemThemeTypeInjectable from "../../features/theme/system-type/renderer/initialize.injectable";
import { beforeFrameStartsInjectionToken } from "../before-frame-starts/tokens";
import activeThemeInjectable from "./active.injectable";
import applyLensThemeInjectable from "./apply-lens-theme.injectable";

const setupApplyActiveThemeInjectable = getInjectable({
  id: "setup-apply-active-theme",
  instantiate: (di) => {
    const activeTheme = di.inject(activeThemeInjectable);
    const applyLensTheme = di.inject(applyLensThemeInjectable);

    return {
      id: "setup-apply-active-theme",
      run: () => {
        reaction(
          () => activeTheme.get(),
          applyLensTheme,
          {
            fireImmediately: true,
          },
        );
      },
      runAfter: di.inject(initializeSystemThemeTypeInjectable),
    };
  },
  injectionToken: beforeFrameStartsInjectionToken,
});

export default setupApplyActiveThemeInjectable;
