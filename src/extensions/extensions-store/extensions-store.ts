/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LensExtensionId } from "../lens-extension";
import { action, computed, makeObservable, observable } from "mobx";
import { toJS } from "../../common/utils";
import { BaseStore } from "../../common/base-store";

export interface LensExtensionsStoreModel {
  extensions: Record<LensExtensionId, LensExtensionState>;
}

export interface LensExtensionState {
  enabled?: boolean;
  name: string;
}

export class ExtensionsStore extends BaseStore<LensExtensionsStoreModel> {
  readonly displayName = "ExtensionsStore";
  constructor() {
    super({
      configName: "lens-extensions",
    });
    makeObservable(this);
    this.load();
  }

  @computed
  get enabledExtensions() {
    return Array.from(this.state.values())
      .filter(({ enabled }) => enabled)
      .map(({ name }) => name);
  }

  protected state = observable.map<LensExtensionId, LensExtensionState>();

  isEnabled({ id, isBundled }: { id: string; isBundled: boolean }): boolean {
    // By default false, so that copied extensions are disabled by default.
    // If user installs the extension from the UI, the Extensions component will specifically enable it.
    return isBundled || Boolean(this.state.get(id)?.enabled);
  }

  mergeState = action((extensionsState: Record<LensExtensionId, LensExtensionState> | [LensExtensionId, LensExtensionState][]) => {
    this.state.merge(extensionsState);
  });

  @action
  protected fromStore({ extensions }: LensExtensionsStoreModel) {
    this.state.merge(extensions);
  }

  toJSON(): LensExtensionsStoreModel {
    return toJS({
      extensions: Object.fromEntries(this.state),
    });
  }
}
