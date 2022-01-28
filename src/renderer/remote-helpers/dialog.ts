/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { dialogShowOpenDialogHandler, requestMain } from "../../common/ipc";

export function showOpenDialog(options: Electron.OpenDialogOptions): Promise<Electron.OpenDialogReturnValue> {
  return requestMain(dialogShowOpenDialogHandler, options);
}
