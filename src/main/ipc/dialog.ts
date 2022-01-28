/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BrowserWindow, dialog, OpenDialogOptions } from "electron";

export async function showOpenDialog(dialogOptions: OpenDialogOptions): Promise<{ canceled: boolean; filePaths: string[]; }> {
  const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), dialogOptions);

  return { canceled, filePaths };
}
