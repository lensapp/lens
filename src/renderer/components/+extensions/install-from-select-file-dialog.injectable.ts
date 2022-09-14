/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { requestOpenFilePickingDialog } from "../../ipc";
import { supportedExtensionFormats } from "./supported-extension-formats";
import attemptInstallsInjectable from "./attempt-installs.injectable";
import directoryForDownloadsInjectable from "../../../common/app-paths/directory-for-downloads.injectable";

const installFromSelectFileDialogInjectable = getInjectable({
  id: "install-from-select-file-dialog",

  instantiate: (di) => {
    const attemptInstalls = di.inject(attemptInstallsInjectable);
    const directoryForDownloads = di.inject(directoryForDownloadsInjectable);

    return async () => {
      const { canceled, filePaths } = await requestOpenFilePickingDialog({
        defaultPath: directoryForDownloads.get(),
        properties: ["openFile", "multiSelections"],
        message: `Select extensions to install (formats: ${supportedExtensionFormats.join(", ")}), `,
        buttonLabel: "Use configuration",
        filters: [{ name: "tarball", extensions: supportedExtensionFormats }],
      });

      if (!canceled) {
        await attemptInstalls(filePaths);
      }
    };
  },
});

export default installFromSelectFileDialogInjectable;
