/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BundledExtensionsUpdated } from "../../../../common/ipc";
import { logger } from "../../../../extensions/common-api";
import type { InstalledExtension } from "../../../../extensions/extension-discovery/extension-discovery";
import { ExtensionUpdater, UpdaterDependencies } from "./extension-updater";

interface Dependencies extends UpdaterDependencies {
  extensions: InstalledExtension[];
  ipcRenderer: { send: (name: string) => void };
}

export class BundledExtensionsUpdater extends ExtensionUpdater {
  constructor(protected dependencies: Dependencies) {
    super(dependencies);
  }

  async updateAll() {
    logger.info("[EXTENSIONS-UPDATER]: Bundled extensions update started.");

    const updates = this.dependencies.extensions.map(this.update);
    try {
      await Promise.allSettled(updates);
    } finally {
      this.dependencies.ipcRenderer.send(BundledExtensionsUpdated);
    }

    logger.info("[EXTENSIONS-UPDATER]: Bundled extensions update finished.");
  }
}