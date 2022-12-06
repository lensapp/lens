/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { FileFilter } from "electron";
import openPathPickingDialogInjectable from "../../../../../../path-picking-dialog/renderer/pick-paths.injectable";

const getFilePathsInjectable = getInjectable({
  id: "get-file-paths",

  instantiate: (di) => {
    const openPathPickingDialog = di.inject(openPathPickingDialogInjectable);

    return async (fileFilter: FileFilter) => await openPathPickingDialog({
      properties: ["openFile", "showHiddenFiles"],
      message: "Select file",
      buttonLabel: "Use file",
      filters: [fileFilter, { name: "Any", extensions: ["*"] }],
    });
  },

  causesSideEffects: true,
});

export default getFilePathsInjectable;
