/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LensExtensionId } from "@k8slens/legacy-extensions";
import { action, computed, observable } from "mobx";
import type { BaseStore } from "../../common/persistent-storage/base-store";
import type { CreatePersistentStorage } from "../../common/persistent-storage/create.injectable";

export interface LensExtensionsStoreModel {
  extensions?: Record<LensExtensionId, LensExtensionState>;
}

export interface LensExtensionState {
  enabled?: boolean;
  name: string;
}

export interface IsEnabledExtensionDescriptor {
  id: string;
  isBundled: boolean;
}

export interface ExtensionsStoreDependencies {
  createPersistentStorage: CreatePersistentStorage;
  readonly storeMigrationVersion: string;
}

export class ExtensionsStore {
  private readonly store: BaseStore<LensExtensionsStoreModel>;

  constructor(private readonly dependencies: ExtensionsStoreDependencies) {
    this.store = this.dependencies.createPersistentStorage({
      configName: "lens-extensions",
      fromStore: action(({ extensions = {}}) => {
        this.state.merge(extensions);
      }),
      toJSON: () => ({
        extensions: Object.fromEntries(this.state),
      }),
      projectVersion: this.dependencies.storeMigrationVersion,
    });
    this.store.load();
  }

  readonly enabledExtensions = computed(() => (
    Array.from(this.state.values())
      .filter(({ enabled }) => enabled)
      .map(({ name }) => name)
  ));

  protected readonly state = observable.map<LensExtensionId, LensExtensionState>();

  isEnabled({ id, isBundled }: IsEnabledExtensionDescriptor): boolean {
    // By default false, so that copied extensions are disabled by default.
    // If user installs the extension from the UI, the Extensions component will specifically enable it.
    return isBundled || Boolean(this.state.get(id)?.enabled);
  }

  mergeState = action((extensionsState: Record<LensExtensionId, LensExtensionState> | [LensExtensionId, LensExtensionState][]) => {
    this.state.merge(extensionsState);
  });
}
