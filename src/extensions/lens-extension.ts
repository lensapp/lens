/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type { InstalledExtension } from "./extension-discovery";
import { action, observable, reaction } from "mobx";
import { FilesystemProvisionerStore } from "../main/extension-filesystem";
import logger from "../main/logger";
import { ProtocolHandlerRegistration } from "./registries";
import { disposer } from "../common/utils";

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

export const Disposers = Symbol();

export class LensExtension {
  readonly id: LensExtensionId;
  readonly manifest: LensExtensionManifest;
  readonly manifestPath: string;
  readonly isBundled: boolean;

  protocolHandlers: ProtocolHandlerRegistration[] = [];

  @observable private isEnabled = false;
  [Disposers] = disposer();

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

  get description() {
    return this.manifest.description;
  }

  /**
   * getExtensionFileFolder returns the path to an already created folder. This
   * folder is for the sole use of this extension.
   *
   * Note: there is no security done on this folder, only obfiscation of the
   * folder name.
   */
  async getExtensionFileFolder(): Promise<string> {
    return FilesystemProvisionerStore.getInstance().requestDirectory(this.id);
  }

  @action
  async enable() {
    if (this.isEnabled) return;
    this.isEnabled = true;
    this.onActivate?.();
    logger.info(`[EXTENSION]: enabled ${this.name}@${this.version}`);
  }

  @action
  async disable() {
    if (!this.isEnabled) return;
    this.isEnabled = false;
    this.onDeactivate?.();
    this[Disposers]();
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

  protected onActivate(): void {
    return;
  }

  protected onDeactivate(): void {
    return;
  }
}

export function sanitizeExtensionName(name: string) {
  return name.replace("@", "").replace("/", "--");
}

export function extensionDisplayName(name: string, version: string) {
  return `${name}@${version}`;
}
