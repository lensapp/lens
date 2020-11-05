import type { LensExtensionId } from "./lens-extension";
import { BaseStore } from "../common/base-store"
import { action, observable, toJS } from "mobx";

export interface LensExtensionsStoreModel {
  extensions: Record<LensExtensionId, LensExtensionState>;
}

export interface LensExtensionState {
  enabled?: boolean;
}

export class ExtensionsStore extends BaseStore<LensExtensionsStoreModel> {
  constructor() {
    super({
      configName: "lens-extensions"
    });
  }

  @observable extensions = observable.map<LensExtensionId, LensExtensionState>();

  @action
  setEnabled(extId: LensExtensionId, enabled: boolean) {
    const state = this.extensions.get(extId);
    this.extensions.set(extId, {
      ...(state || {}),
      enabled: enabled,
    })
  }

  isEnabled(extensionId: LensExtensionId) {
    const state = this.extensions.get(extensionId);
    return !state /* enabled by default */ || state.enabled;
  }

  protected fromStore({ extensions }: LensExtensionsStoreModel) {
    this.extensions.merge(extensions);
  }

  toJSON(): LensExtensionsStoreModel {
    return toJS({
      extensions: this.extensions.toJSON(),
    }, {
      recurseEverything: true
    })
  }
}

export const extensionsStore = new ExtensionsStore();
