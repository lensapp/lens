/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsInjectionToken } from "../../../../renderer/before-frame-starts/tokens";
import initUserStoreInjectable from "../../../../renderer/stores/init-user-store.injectable";
import systemThemeConfigurationInjectable from "../../../../renderer/themes/system-theme.injectable";
import requestInitialSystemThemeTypeInjectable from "./request-initial.injectable";

const initializeSystemThemeTypeInjectable = getInjectable({
  id: "initialize-system-theme-type",
  instantiate: (di) => ({
    id: "initialize-system-theme-type",
    run: async () => {
      const systemThemeConfiguration = di.inject(systemThemeConfigurationInjectable);
      const requestInitialSystemThemeType = di.inject(requestInitialSystemThemeTypeInjectable);

      systemThemeConfiguration.set(await requestInitialSystemThemeType());
    },
    runAfter: di.inject(initUserStoreInjectable),
  }),
  injectionToken: beforeFrameStartsInjectionToken,
});

export default initializeSystemThemeTypeInjectable;
