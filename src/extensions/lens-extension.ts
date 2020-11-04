import type { InstalledExtension } from "./extension-manager";
import { action, reaction } from "mobx";
import logger from "../main/logger";
import { ExtensionStore } from "./extension-store";

export type LensExtensionId = string; // path to manifest (package.json)
export type LensExtensionConstructor = new (...args: ConstructorParameters<typeof LensExtension>) => LensExtension;

export interface LensExtensionManifest {
  name: string;
  version: string;
  description?: string;
  main?: string; // path to %ext/dist/main.js
  renderer?: string; // path to %ext/dist/renderer.js
}

export interface LensExtensionStoreModel {
  isEnabled: boolean;
}

export class LensExtension<S extends ExtensionStore<LensExtensionStoreModel> = any> {
  protected store: S;
  readonly manifest: LensExtensionManifest;
  readonly manifestPath: string;
  readonly isBundled: boolean;

  constructor({ manifest, manifestPath, isBundled }: InstalledExtension) {
    this.manifest = manifest
    this.manifestPath = manifestPath
    this.isBundled = !!isBundled
    this.init();
  }

  protected async init(store: S = createBaseStore().getInstance()) {
    this.store = store;
    await this.store.loadExtension(this);
    reaction(() => this.store.data.isEnabled, (isEnabled = true) => {
      this.toggle(isEnabled); // handle activation & deactivation
    }, {
      fireImmediately: true
    });
  }

  get isEnabled() {
    return !!this.store.data.isEnabled;
  }

  get id(): LensExtensionId {
    return this.manifestPath;
  }

  get name() {
    return this.manifest.name
  }

  get version() {
    return this.manifest.version
  }

  get description() {
    return this.manifest.description
  }

  @action
  async enable() {
    if (this.isEnabled) return;
    this.store.data.isEnabled = true;
    this.onActivate();
    logger.info(`[EXTENSION]: enabled ${this.name}@${this.version}`);
  }

  @action
  async disable() {
    if (!this.isEnabled) return;
    this.store.data.isEnabled = false;
    this.onDeactivate();
    logger.info(`[EXTENSION]: disabled ${this.name}@${this.version}`);
  }

  toggle(enable?: boolean) {
    if (typeof enable === "boolean") {
      enable ? this.enable() : this.disable()
    } else {
      this.isEnabled ? this.disable() : this.enable()
    }
  }

  async whenEnabled(handlers: () => Function[]) {
    const disposers: Function[] = [];
    const unregisterHandlers = () => {
      disposers.forEach(unregister => unregister())
      disposers.length = 0;
    }
    const cancelReaction = reaction(() => this.isEnabled, isEnabled => {
      if (isEnabled) {
        disposers.push(...handlers());
      } else {
        unregisterHandlers();
      }
    }, {
      fireImmediately: true
    })
    return () => {
      unregisterHandlers();
      cancelReaction();
    }
  }

  protected onActivate() {
    // mock
  }

  protected onDeactivate() {
    // mock
  }
}

function createBaseStore() {
  return class extends ExtensionStore<LensExtensionStoreModel> {
    constructor() {
      super({
        configName: "state"
      });
    }
  }
}
