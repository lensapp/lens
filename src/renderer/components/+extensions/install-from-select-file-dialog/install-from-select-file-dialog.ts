/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { dialog } from "../../../remote-helpers";
import { supportedExtensionFormats } from "../supported-extension-formats";

interface Dependencies {
  attemptInstalls: (filePaths: string[]) => Promise<void>
  directoryForDownloads: string
}

export const installFromSelectFileDialog =
  ({ attemptInstalls, directoryForDownloads }: Dependencies) =>
    async () => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        defaultPath: directoryForDownloads,
        properties: ["openFile", "multiSelections"],
        message: `Select extensions to install (formats: ${supportedExtensionFormats.join(
          ", ",
        )}), `,
        buttonLabel: "Use configuration",
        filters: [{ name: "tarball", extensions: supportedExtensionFormats }],
      });

      if (!canceled) {
        await attemptInstalls(filePaths);
      }
    };
