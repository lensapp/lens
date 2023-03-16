/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { LensExtensionId } from "@k8slens/legacy-extensions";
import { iter, object } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { action, computed, observable } from "mobx";
import createPersistentStorageInjectable from "../common/persistent-storage/create.injectable";
import storeMigrationVersionInjectable from "../common/vars/store-migration-version.injectable";

export interface LensExtensionState {
  enabled?: boolean;
  name: string;
}

export interface IsEnabledExtensionDescriptor {
  id: string;
  isBundled: boolean;
}

export interface EnabledExtensionsState {
  readonly enabledExtensions: IComputedValue<string[]>;
  isEnabled: (desc: IsEnabledExtensionDescriptor) => boolean;
  mergeState: (newPartialState: Partial<Record<LensExtensionId, LensExtensionState>> | [LensExtensionId, LensExtensionState][]) => void;
}

const enabledExtensionsStateInjectable = getInjectable({
  id: "enabled-extensions-state",
  instantiate: (di): EnabledExtensionsState => {
    const storeMigrationVersion = di.inject(storeMigrationVersionInjectable);
    const createPersistentStorage = di.inject(createPersistentStorageInjectable);

    const state = observable.map<LensExtensionId, LensExtensionState>();
    const storage = createPersistentStorage({
      configName: "lens-extensions",
      fromStore: action(({ extensions = {}}) => {
        state.merge(extensions);
      }),
      toJSON: () => ({
        extensions: Object.fromEntries(state),
      }),
      projectVersion: storeMigrationVersion,
    });

    // NOTE: this is done implicitly here currently
    storage.loadAndStartSyncing();

    return {
      enabledExtensions: computed(() => (
        iter.chain(state.values())
          .filter(({ enabled }) => enabled)
          .map(({ name }) => name)
          .toArray()
      )),
      isEnabled: ({ id, isBundled }) => isBundled || (state.get(id)?.enabled ?? false),
      mergeState: action((newPartialState) => {
        if (Array.isArray(newPartialState)) {
          state.merge(newPartialState);
        } else {
          state.merge(object.entries(newPartialState));
        }
      }),
    };
  },
});

export default enabledExtensionsStateInjectable;
