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
import { downloadFile, ExtendableDisposer } from "../../../../common/utils";
import { InputValidators } from "../../input";
import { ExtensionInstallationStateStore } from "../extension-install.store";
import { getMessageFromError } from "../get-message-from-error/get-message-from-error";
import logger from "../../../../main/logger";
import { Notifications } from "../../notifications";
import path from "path";
import React from "react";
import { readFileNotify } from "../read-file-notify/read-file-notify";
import type { InstallRequest } from "../attempt-install/install-request";
import type { ExtensionInfo } from "../attempt-install-by-info/attempt-install-by-info";

export interface Dependencies {
  attemptInstall: (request: InstallRequest, disposer?: ExtendableDisposer) => Promise<void>,
  attemptInstallByInfo: (extensionInfo: ExtensionInfo) => Promise<void>
}

export const installFromInput = ({ attemptInstall, attemptInstallByInfo }: Dependencies) => async (input: string) => {
  let disposer: ExtendableDisposer | undefined = undefined;

  try {
    // fixme: improve error messages for non-tar-file URLs
    if (InputValidators.isUrl.validate(input)) {
      // install via url
      disposer = ExtensionInstallationStateStore.startPreInstall();
      const { promise } = downloadFile({ url: input, timeout: 10 * 60 * 1000 });
      const fileName = path.basename(input);

      await attemptInstall({ fileName, dataP: promise }, disposer);
    } else if (InputValidators.isPath.validate(input)) {
      // install from system path
      const fileName = path.basename(input);

      await attemptInstall({ fileName, dataP: readFileNotify(input) });
    } else if (InputValidators.isExtensionNameInstall.validate(input)) {
      const [{ groups: { name, version }}] = [...input.matchAll(InputValidators.isExtensionNameInstallRegex)];

      await attemptInstallByInfo({ name, version });
    }
  } catch (error) {
    const message = getMessageFromError(error);

    logger.info(`[EXTENSION-INSTALL]: installation has failed: ${message}`, { error, installPath: input });
    Notifications.error(<p>Installation has failed: <b>{message}</b></p>);
  } finally {
    disposer?.();
  }
};
