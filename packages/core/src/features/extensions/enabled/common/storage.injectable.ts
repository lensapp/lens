/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { LensExtensionId } from "@k8slens/legacy-extensions";
import { getInjectable } from "@ogre-tools/injectable";
import { action, toJS } from "mobx";
import createPersistentStorageInjectable from "../../../../common/persistent-storage/create.injectable";
import persistentStorageMigrationsInjectable from "../../../../common/persistent-storage/migrations.injectable";
import { enabledExtensionsMigrationDeclarationInjectionToken } from "./migrations";
import type { LensExtensionState } from "./state.injectable";
import enabledExtensionsStateInjectable from "./state.injectable";

interface EnabledExtensionsStorageModal {
  extensions: [LensExtensionId, LensExtensionState][];
}

const enabledExtensionsPersistentStorageInjectable = getInjectable({
  id: "enabled-extensions-persistent-storage",
  instantiate: (di) => {
    const createPersistentStorage = di.inject(createPersistentStorageInjectable);
    const state = di.inject(enabledExtensionsStateInjectable);

    return createPersistentStorage<EnabledExtensionsStorageModal>({
      configName: "lens-extensions",
      fromStore: action(({ extensions = [] }) => {
        state.replace(extensions);
      }),
      toJSON: () => ({
        extensions: [...toJS(state)],
      }),
      projectVersion: "6.5.0",  // temporary fix for #7784, otherwise calculated wrong on the renderer process
      migrations: di.inject(persistentStorageMigrationsInjectable, enabledExtensionsMigrationDeclarationInjectionToken),
    });
  },
});

export default enabledExtensionsPersistentStorageInjectable;
