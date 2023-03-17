/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsSecondInjectionToken } from "../../../../renderer/before-frame-starts/tokens";
import initUserStoreInjectable from "../../../user-preferences/renderer/load-storage.injectable";
import systemThemeConfigurationInjectable from "../../../../renderer/themes/system-theme.injectable";
import requestInitialSystemThemeTypeInjectable from "./request-initial.injectable";

const initializeSystemThemeTypeInjectable = getInjectable({
  id: "initialize-system-theme-type",
  instantiate: (di) => ({
    run: async () => {
      const systemThemeConfiguration = di.inject(systemThemeConfigurationInjectable);
      const requestInitialSystemThemeType = di.inject(requestInitialSystemThemeTypeInjectable);

      systemThemeConfiguration.set(await requestInitialSystemThemeType());
    },
    runAfter: initUserStoreInjectable,
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default initializeSystemThemeTypeInjectable;
