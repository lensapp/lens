/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { InstalledExtension } from "../../../../extensions/extension-discovery/extension-discovery"

export interface UpdaterDependencies {
  installFromInput: (input: string) => Promise<void>;
}

export class ExtensionUpdater {
  constructor(protected dependencies : UpdaterDependencies) {
  }

  async update({ availableUpdate, manifest }: InstalledExtension): Promise<void> {
    return new Promise((resolve, reject) => {
      if (availableUpdate) {
        console.info(`[EXTENSIONS-UPDATER]: Trying to update ${manifest.name} extension`);

        resolve();
        // TODO: actual install
        // this.dependencies.installFromInput(availableUpdate.input);
      }
      reject("Update failed");
    });

  }
}