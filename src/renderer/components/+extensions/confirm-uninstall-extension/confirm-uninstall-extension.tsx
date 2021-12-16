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
import React from "react";
import type { InstalledExtension } from "../../../../extensions/extension-discovery";
import type { LensExtensionId } from "../../../../extensions/lens-extension";
import { extensionDisplayName } from "../../../../extensions/lens-extension";
import { ConfirmDialog } from "../../confirm-dialog";

export interface Dependencies {
  uninstallExtension: (id: LensExtensionId) => Promise<void>;
}

export const confirmUninstallExtension =
  ({ uninstallExtension }: Dependencies) =>
    async (extension: InstalledExtension): Promise<void> => {
      const displayName = extensionDisplayName(
        extension.manifest.name,
        extension.manifest.version,
      );
      const confirmed = await ConfirmDialog.confirm({
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
    };
