/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ExtendableDisposer } from "../../../../common/utils";
import { downloadFile } from "../../../../common/utils";
import { InputValidators } from "../../input";
import { getMessageFromError } from "../get-message-from-error/get-message-from-error";
import logger from "../../../../main/logger";
import { Notifications } from "../../notifications";
import path from "path";
import React from "react";
import { readFileNotify } from "../read-file-notify/read-file-notify";
import type { InstallRequest } from "../attempt-install/install-request";
import type { ExtensionInfo } from "../attempt-install-by-info/attempt-install-by-info";
import type { ExtensionInstallationStateStore } from "../../../../extensions/extension-installation-state-store/extension-installation-state-store";
import { AsyncInputValidationError } from "../../input/input_validators";

interface Dependencies {
  attemptInstall: (request: InstallRequest, disposer?: ExtendableDisposer) => Promise<void>;
  attemptInstallByInfo: (extensionInfo: ExtensionInfo) => Promise<void>;
  extensionInstallationStateStore: ExtensionInstallationStateStore;
}

export const installFromInput = ({
  attemptInstall,
  attemptInstallByInfo,
  extensionInstallationStateStore,
}: Dependencies) => (
  async (input: string): Promise<void> => {
    let disposer: ExtendableDisposer | undefined = undefined;

    try {
      // fixme: improve error messages for non-tar-file URLs
      if (InputValidators.isUrl.validate(input, {})) {
        // install via url
        disposer = extensionInstallationStateStore.startPreInstall();
        const { promise } = downloadFile({ url: input, timeout: 10 * 60 * 1000 });
        const fileName = path.basename(input);

        return await attemptInstall({ fileName, dataP: promise }, disposer);
      }

      try {
        await InputValidators.isPath.validate(input, {});

        // install from system path
        const fileName = path.basename(input);

        return await attemptInstall({ fileName, dataP: readFileNotify(input) });
      } catch (error) {
        if (error instanceof AsyncInputValidationError) {
          const extNameCaptures = InputValidators.isExtensionNameInstallRegex.captures(input);

          if (extNameCaptures) {
            const { name, version } = extNameCaptures;

            return await attemptInstallByInfo({ name, version });
          }
        } else {
          throw error;
        }
      }

      throw new Error(`Unknown format of input: ${input}`);
    } catch (error) {
      const message = getMessageFromError(error);

      logger.info(`[EXTENSION-INSTALL]: installation has failed: ${message}`, { error, installPath: input });
      Notifications.error((
        <p>
          {"Installation has failed: "}
          <b>{message}</b>
        </p>
      ));
    } finally {
      disposer?.();
    }
  }
);
