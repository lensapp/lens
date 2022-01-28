/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { InstalledExtension } from "../../../../extensions/extension-discovery/extension-discovery";
import type { LensExtensionId } from "../../../../extensions/lens-extension";
import { extensionDisplayName } from "../../../../extensions/lens-extension";
import type { ConfirmDialogBooleanParams } from "../../confirm-dialog";

interface Dependencies {
  uninstallExtension: (id: LensExtensionId) => Promise<boolean>;
  confirmWithDialog: (params: ConfirmDialogBooleanParams) => Promise<boolean>;
}

export async function confirmUninstallExtension(
  { uninstallExtension, confirmWithDialog }: Dependencies,
  extension: InstalledExtension,
): Promise<void> {
  const displayName = extensionDisplayName(
    extension.manifest.name,
    extension.manifest.version,
  );
  const confirmed = await confirmWithDialog({
    message: (
      <p>
          Are you sure you want to uninstall extension <b>{displayName}</b>?
      </p>
    ),
    labelOk: "Yes",
    labelCancel: "No",
  });

  if (confirmed) {
    await uninstallExtension(extension.id);
  }
}
