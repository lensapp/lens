import type { LensExtensionId } from "./lens-extension";
import { BaseStore } from "../common/base-store";
import { action, computed, observable, toJS } from "mobx";

export interface LensExtensionsStoreModel {
  extensions: Record<LensExtensionId, LensExtensionState>;
}

export interface LensExtensionState {
  enabled?: boolean;
  name: string;
}

export class ExtensionsStore extends BaseStore<LensExtensionsStoreModel> {
  constructor() {
    super({
      configName: "lens-extensions",
    });
  }

  @computed
  get enabledExtensions() {
    return Array.from(this.state.values())
      .filter(({enabled}) => enabled)
      .map(({name}) => name);
  }

  protected state = observable.map<LensExtensionId, LensExtensionState>();

  isEnabled(extId: LensExtensionId): boolean {
    const state = this.state.get(extId);

    // By default false, so that copied extensions are disabled by default.
    // If user installs the extension from the UI, the Extensions component will specifically enable it.
    return Boolean(state?.enabled);
  }

  @action
  mergeState(extensionsState: Record<LensExtensionId, LensExtensionState>) {
    this.state.merge(extensionsState);
  }

  @action
  protected fromStore({ extensions }: LensExtensionsStoreModel) {
    this.state.merge(extensions);
  }

  toJSON(): LensExtensionsStoreModel {
    return toJS({
      extensions: this.state.toJSON(),
    }, {
      recurseEverything: true
    });
  }
}

export const extensionsStore = new ExtensionsStore();
