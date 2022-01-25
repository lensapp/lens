/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { UpdateBundledExtension } from "../../../../common/ipc";
import { logger } from "../../../../extensions/common-api";
import type { InstalledExtension } from "../../../../extensions/extension-discovery/extension-discovery";
import { ExtensionUpdater, UpdaterDependencies } from "./extension-updater";

interface Dependencies extends UpdaterDependencies {
  extensions: InstalledExtension[];
  ipcRenderer: { send: (name: string) => void, on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => any) => void };
}

export class BundledExtensionsUpdater extends ExtensionUpdater {
  constructor(protected dependencies: Dependencies) {
    super(dependencies);
  }

  init() {
    this.dependencies.ipcRenderer.on(UpdateBundledExtension, async (event, extensionId: string) => {
      const extension = this.dependencies.extensions.find(extension => extension.id == extensionId);

      if (extension?.isBundled && extension?.availableUpdate) {
        try {
          await this.update(extension);
        } catch (err) {
          logger.error(`Update failed for ${extension.manifest.name}`)
        }
      }
    });
  }
}