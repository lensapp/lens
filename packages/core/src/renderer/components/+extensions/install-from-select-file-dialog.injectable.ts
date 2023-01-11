/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { supportedExtensionFormats } from "./supported-extension-formats";
import attemptInstallsInjectable from "./attempt-installs.injectable";
import directoryForDownloadsInjectable from "../../../common/app-paths/directory-for-downloads/directory-for-downloads.injectable";
import openPathPickingDialogInjectable from "../../../features/path-picking-dialog/renderer/pick-paths.injectable";

export type InstallFromSelectFileDialog = () => Promise<void>;

const installFromSelectFileDialogInjectable = getInjectable({
  id: "install-from-select-file-dialog",

  instantiate: (di): InstallFromSelectFileDialog => {
    const attemptInstalls = di.inject(attemptInstallsInjectable);
    const directoryForDownloads = di.inject(directoryForDownloadsInjectable);
    const openPathPickingDialog = di.inject(openPathPickingDialogInjectable);

    return () => openPathPickingDialog({
      defaultPath: directoryForDownloads,
      properties: ["openFile", "multiSelections"],
      message: `Select extensions to install (formats: ${supportedExtensionFormats.join(", ")}), `,
      buttonLabel: "Use configuration",
      filters: [{ name: "tarball", extensions: supportedExtensionFormats }],
      onPick: attemptInstalls,
    });
  },
});

export default installFromSelectFileDialogInjectable;
