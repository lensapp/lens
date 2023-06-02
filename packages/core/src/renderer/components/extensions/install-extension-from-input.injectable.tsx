/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { ExtendableDisposer } from "@k8slens/utilities";
import { InputValidators } from "../input";
import { getMessageFromError } from "./get-message-from-error/get-message-from-error";
import { getInjectable } from "@ogre-tools/injectable";
import attemptInstallInjectable from "./attempt-install/attempt-install.injectable";
import attemptInstallByInfoInjectable from "./attempt-install-by-info.injectable";
import extensionInstallationStateStoreInjectable from "../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import readFileNotifyInjectable from "./read-file-notify/read-file-notify.injectable";
import getBasenameOfPathInjectable from "../../../common/path/get-basename.injectable";
import { showErrorNotificationInjectable } from "@k8slens/notifications";
import { loggerInjectionToken } from "@k8slens/logger";
import downloadBinaryInjectable from "../../../common/fetch/download-binary.injectable";
import { withTimeout } from "../../../common/fetch/timeout-controller";

export type InstallExtensionFromInput = (input: string) => Promise<void>;

const installExtensionFromInputInjectable = getInjectable({
  id: "install-extension-from-input",

  instantiate: (di): InstallExtensionFromInput => {
    const attemptInstall = di.inject(attemptInstallInjectable);
    const attemptInstallByInfo = di.inject(attemptInstallByInfoInjectable);
    const extensionInstallationStateStore = di.inject(extensionInstallationStateStoreInjectable);
    const readFileNotify = di.inject(readFileNotifyInjectable);
    const getBasenameOfPath = di.inject(getBasenameOfPathInjectable);
    const showErrorNotification = di.inject(showErrorNotificationInjectable);
    const logger = di.inject(loggerInjectionToken);
    const downloadBinary = di.inject(downloadBinaryInjectable);

    return async (input) => {
      let disposer: ExtendableDisposer | undefined = undefined;

      try {
        // fixme: improve error messages for non-tar-file URLs
        if (InputValidators.isUrl.validate(input)) {
          // install via url
          disposer = extensionInstallationStateStore.startPreInstall();
          const { signal } = withTimeout(10 * 60 * 1000);
          const result = await downloadBinary(input, { signal });

          if (!result.callWasSuccessful) {
            showErrorNotification(`Failed to download extension: ${result.error}`);

            return disposer();
          }

          const fileName = getBasenameOfPath(input);

          return await attemptInstall({ fileName, data: result.response }, disposer);
        }

        try {
          await InputValidators.isPath.validate(input);

          // install from system path
          const fileName = getBasenameOfPath(input);
          const data = await readFileNotify(input);

          if (!data) {
            return;
          }

          return await attemptInstall({ fileName, data });
        } catch (error) {
          const extNameCaptures = InputValidators.isExtensionNameInstallRegex.captures(input);

          if (extNameCaptures) {
            const { name, version } = extNameCaptures;

            return await attemptInstallByInfo({ name, version });
          }
        }

        throw new Error(`Unknown format of input: ${input}`);
      } catch (error) {
        const message = getMessageFromError(error);

        logger.info(`[EXTENSION-INSTALL]: installation has failed: ${message}`, { error, installPath: input });
        showErrorNotification((
          <p>
            {"Installation has failed: "}
            <b>{message}</b>
          </p>
        ));
      } finally {
        disposer?.();
      }
    };
  },
});

export default installExtensionFromInputInjectable;
