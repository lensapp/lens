/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BundledExtensionsLoaded, ipcRendererOn } from "../../common/ipc"
import { logger } from "../common-api";
import type { InstalledExtension } from "../extension-discovery/extension-discovery";
import { ExtensionUpdater, UpdaterDependencies } from "./extension-updater";

interface Dependencies extends UpdaterDependencies {
  extensions: InstalledExtension[];
}

export class BundledExtensionsUpdater extends ExtensionUpdater {
  constructor(protected dependencies: Dependencies) {
    super(dependencies);
  }

  init() {
    ipcRendererOn(BundledExtensionsLoaded, (event) => {
      this.updateAll();
    });
  }

  private async updateAll() {
    logger.info("[EXTENSIONS-UPDATER]: Bundled extensions update started.");

    const updates = this.dependencies.extensions.map(this.update);
    await Promise.allSettled(updates);

    logger.info("[EXTENSIONS-UPDATER]: Bundled extensions update finished.");
  }
}