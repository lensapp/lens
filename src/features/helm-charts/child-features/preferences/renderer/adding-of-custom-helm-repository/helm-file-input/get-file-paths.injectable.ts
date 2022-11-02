/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { FileFilter } from "electron";
import { requestOpenFilePickingDialog } from "../../../../../../../renderer/ipc";

const getFilePathsInjectable = getInjectable({
  id: "get-file-paths",

  instantiate: () => async (fileFilter: FileFilter) =>
    await requestOpenFilePickingDialog({
      properties: ["openFile", "showHiddenFiles"],
      message: `Select file`,
      buttonLabel: `Use file`,
      filters: [fileFilter, { name: "Any", extensions: ["*"] }],
    }),

  causesSideEffects: true,
});

export default getFilePathsInjectable;
