import type { InstalledExtension } from "./extension-discovery";
import { action, observable, reaction } from "mobx";
import { filesystemProvisionerStore } from "../main/extension-filesystem";
import logger from "../main/logger";
import { ProtocolHandlerRegistration } from "./registries/protocol-handler-registry";

export type LensExtensionId = string; // path to manifest (package.json)
export type LensExtensionConstructor = new (...args: ConstructorParameters<typeof LensExtension>) => LensExtension;

export interface LensExtensionManifest {
  name: string;
  version: string;
  description?: string;
  main?: string; // path to %ext/dist/main.js
  renderer?: string; // path to %ext/dist/renderer.js
  lens?: object; // fixme: add more required fields for validation
}

export class LensExtension {
  readonly id: LensExtensionId;
  readonly manifest: LensExtensionManifest;
  readonly manifestPath: string;
  readonly isBundled: boolean;

  protocolHandlers: ProtocolHandlerRegistration[] = [];

  @observable private isEnabled = false;

  constructor({ id, manifest, manifestPath, isBundled }: InstalledExtension) {
    this.id = id;
    this.manifest = manifest;
    this.manifestPath = manifestPath;
    this.isBundled = !!isBundled;
  }

  get name() {
    return this.manifest.name;
  }

  get version() {
    return this.manifest.version;
  }

  /**
   * getExtensionFileFolder returns the path to an already created folder. This
   * folder is for the sole use of this extension.
   *
   * Note: there is no security done on this folder, only obfiscation of the
   * folder name.
   */
  async getExtensionFileFolder(): Promise<string> {
    return filesystemProvisionerStore.requestDirectory(this.id);
  }

  get description() {
    return this.manifest.description;
  }

  @action
  async enable() {
    if (this.isEnabled) return;
    this.isEnabled = true;
    this.onActivate();
    logger.info(`[EXTENSION]: enabled ${this.name}@${this.version}`);
  }

  @action
  async disable() {
    if (!this.isEnabled) return;
    this.isEnabled = false;
    this.onDeactivate();
    logger.info(`[EXTENSION]: disabled ${this.name}@${this.version}`);
  }

  toggle(enable?: boolean) {
    if (typeof enable === "boolean") {
      enable ? this.enable() : this.disable();
    } else {
      this.isEnabled ? this.disable() : this.enable();
    }
  }

  async whenEnabled(handlers: () => Promise<Function[]>) {
    const disposers: Function[] = [];
    const unregisterHandlers = () => {
      disposers.forEach(unregister => unregister());
      disposers.length = 0;
    };
    const cancelReaction = reaction(() => this.isEnabled, async (isEnabled) => {
      if (isEnabled) {
        const handlerDisposers = await handlers();

        disposers.push(...handlerDisposers);
      } else {
        unregisterHandlers();
      }
    }, {
      fireImmediately: true
    });

    return () => {
      unregisterHandlers();
      cancelReaction();
    };
  }

  protected onActivate() {
    // mock
  }

  protected onDeactivate() {
    // mock
  }
}

export function sanitizeExtensionName(name: string) {
  return name.replace("@", "").replace("/", "--");
}

export function extensionDisplayName(name: string, version: string) {
  return `${name}@${version}`;
}
