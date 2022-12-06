/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { FileFilter } from "electron";
import type { PathPickOpts } from "../../../../../../../renderer/components/path-picker";
import openPathPickingDialogInjectable from "../../../../../../path-picking-dialog/renderer/pick-paths.injectable";

export interface RequestFilePathOptions extends Pick<PathPickOpts, "onCancel" | "onPick"> {
  filter: FileFilter;
}

export type RequestFilePaths = (options: RequestFilePathOptions) => Promise<void>;

const requestFilePathsInjectable = getInjectable({
  id: "request-file-paths",

  instantiate: (di): RequestFilePaths => {
    const openPathPickingDialog = di.inject(openPathPickingDialogInjectable);

    return async ({ filter, ...opts }) => await openPathPickingDialog({
      properties: ["openFile", "showHiddenFiles"],
      message: "Select file",
      buttonLabel: "Use file",
      filters: [filter, { name: "Any", extensions: ["*"] }],
      ...opts,
    });
  },
});

export default requestFilePathsInjectable;
