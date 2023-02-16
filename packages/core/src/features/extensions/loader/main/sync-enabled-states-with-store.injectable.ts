/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { autorun } from "mobx";
import extensionsStoreInjectable from "../../../../extensions/extensions-store/extensions-store.injectable";
import { onLoadOfApplicationInjectionToken } from "../../../../main/library";
import installedUserExtensionsInjectable from "../../common/user-extensions.injectable";

const syncExtensionEnabledStateWithStoreInjectable = getInjectable({
  id: "sync-extension-enabled-state-with-store",
  instantiate: (di) => ({
    id: "sync-extension-enabled-state-with-store",
    run: () => {
      const extensionsStore = di.inject(extensionsStoreInjectable);
      const installedUserExtensions = di.inject(installedUserExtensionsInjectable);

      autorun(() => {
        extensionsStore.state.merge((
          [...installedUserExtensions.get().entries()]
            .map(([extId, extension]) => [extId, {
              enabled: extension.isEnabled,
              name: extension.manifest.name,
            }] as const)
        ));
      });
    },
  }),
  injectionToken: onLoadOfApplicationInjectionToken,
});

export default syncExtensionEnabledStateWithStoreInjectable;
