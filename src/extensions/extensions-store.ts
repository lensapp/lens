import type { LensExtensionId } from "./lens-extension";
import type { ExtensionLoader } from "./extension-loader";
import { BaseStore } from "../common/base-store";
import { action, computed, observable, reaction, toJS } from "mobx";

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

  protected getState(extensionLoader: ExtensionLoader) {
    const state: Record<LensExtensionId, LensExtensionState> = {};

    return Array.from(extensionLoader.userExtensions).reduce((state, [extId, ext]) => {
      state[extId] = {
        enabled: ext.isEnabled,
        name: ext.manifest.name,
      };

      return state;
    }, state);
  }

  async manageState(extensionLoader: ExtensionLoader) {
    await extensionLoader.whenLoaded;
    await this.whenLoaded;

    // save state on change `extension.isEnabled`
    reaction(() => this.getState(extensionLoader), extensionsState => {
      this.state.merge(extensionsState);
    });
  }

  isEnabled(extId: LensExtensionId) {
    const state = this.state.get(extId);

    // By default false, so that copied extensions are disabled by default.
    // If user installs the extension from the UI, the Extensions component will specifically enable it.
    return Boolean(state?.enabled);
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
