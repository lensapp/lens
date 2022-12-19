/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import userStoreInjectable from "../../common/user-store/user-store.injectable";
import setLoginItemSettingsInjectable from "../electron-app/features/set-login-item-settings.injectable";
import { onLoadOfApplicationInjectionToken } from "../start-main-application/runnable-tokens/on-load-of-application-injection-token";

const setupSyncOpenAtLoginWithOsInjectable = getInjectable({
  id: "setup-sync-open-at-login-with-os",
  instantiate: (di) => {
    const setLoginItemSettings = di.inject(setLoginItemSettingsInjectable);
    const userStore = di.inject(userStoreInjectable);

    return {
      id: "setup-sync-open-at-login-with-os",
      run: () => {
        reaction(() => userStore.openAtLogin, openAtLogin => {
          setLoginItemSettings({
            openAtLogin,
            openAsHidden: true,
            args: ["--hidden"],
          });
        }, {
          fireImmediately: true,
        });
      },
    };
  },
  injectionToken: onLoadOfApplicationInjectionToken,
});

export default setupSyncOpenAtLoginWithOsInjectable;
