/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { dialog } from "../../../remote-helpers";
import { AppPaths } from "../../../../common/app-paths";
import { supportedExtensionFormats } from "../supported-extension-formats";

interface Dependencies {
  attemptInstalls: (filePaths: string[]) => Promise<void>
}

export const installFromSelectFileDialog =
  ({ attemptInstalls }: Dependencies) =>
    async () => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        defaultPath: AppPaths.get("downloads"),
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
