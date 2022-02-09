/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { saveFileDialog } from "./saveFile";

const openSaveFileDialogInjectable = getInjectable({
  id: "open-save-file-dialog",
  instantiate: () => saveFileDialog,
});

export default openSaveFileDialogInjectable;
