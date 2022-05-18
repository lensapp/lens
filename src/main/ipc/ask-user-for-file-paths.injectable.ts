/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { OpenDialogOptions } from "electron";
import { dialog } from "electron";
import { getInjectable } from "@ogre-tools/injectable";
import showApplicationWindowInjectable from "../start-main-application/lens-window/show-application-window.injectable";

// TODO: Replace leaking electron with abstraction
export type AskUserForFilePaths = (
  dialogOptions: OpenDialogOptions
) => Promise<{ canceled: boolean; filePaths: string[] }>;

const askUserForFilePathsInjectable = getInjectable({
  id: "ask-user-for-file-paths",

  instantiate: (di): AskUserForFilePaths => {
    const showApplicationWindow = di.inject(showApplicationWindowInjectable);

    return async (dialogOptions) => {
      await showApplicationWindow();

      const { canceled, filePaths } = await dialog.showOpenDialog(
        dialogOptions,
      );

      return { canceled, filePaths };
    };
  },

  causesSideEffects: true,
});

export default askUserForFilePathsInjectable;
