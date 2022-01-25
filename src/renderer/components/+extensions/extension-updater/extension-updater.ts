/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import logger from "../../../../common/logger";
import type { InstalledExtension } from "../../../../extensions/extension-discovery/extension-discovery"

export interface UpdaterDependencies {
  installFromInput: (input: string) => Promise<void>;
}

export class ExtensionUpdater {
  constructor(protected dependencies : UpdaterDependencies) {
  }

  async update({ availableUpdate, manifest }: InstalledExtension): Promise<void> {
    logger.info(`[EXTENSION-UPDATER]: Trying to update ${manifest.name} extension`);
    return this.dependencies.installFromInput(availableUpdate.input);
  }
}