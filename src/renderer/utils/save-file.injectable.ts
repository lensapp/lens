/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { saveFileDialog } from "./saveFile";

const openSaveFileDialogInjectable = getInjectable({
  instantiate: () => saveFileDialog,
  lifecycle: lifecycleEnum.singleton,
});

export default openSaveFileDialogInjectable;
