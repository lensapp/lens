/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { OpenDialogOptions } from "electron";
import { dialog } from "electron";

export type ShowOpenDialog = (options: OpenDialogOptions) => Promise<Electron.OpenDialogReturnValue>;

const showOpenDialogInjectable = getInjectable({
  id: "show-open-dialog",
  instantiate: (): ShowOpenDialog => opts => dialog.showOpenDialog(opts),
  causesSideEffects: true,
});

export default showOpenDialogInjectable;
