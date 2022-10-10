/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { ExtendableDisposer } from "../../../common/utils";
import { downloadFile } from "../../../common/utils";
import { InputValidators } from "../input";
import { getMessageFromError } from "./get-message-from-error/get-message-from-error";
import { getInjectable } from "@ogre-tools/injectable";
import attemptInstallInjectable from "./attempt-install/attempt-install.injectable";
import attemptInstallByInfoInjectable from "./attempt-install-by-info.injectable";
import extensionInstallationStateStoreInjectable from "../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import readFileNotifyInjectable from "./read-file-notify/read-file-notify.injectable";
import getBasenameOfPathInjectable from "../../../common/path/get-basename.injectable";
import showErrorNotificationInjectable from "../notifications/show-error-notification.injectable";
import loggerInjectable from "../../../common/logger.injectable";

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
    const logger = di.inject(loggerInjectable);

    return async (input) => {
      let disposer: ExtendableDisposer | undefined = undefined;

      try {
      // fixme: improve error messages for non-tar-file URLs
        if (InputValidators.isUrl.validate(input)) {
        // install via url
          disposer = extensionInstallationStateStore.startPreInstall();
          const { promise } = downloadFile({ url: input, timeout: 10 * 60 * 1000 });
          const fileName = getBasenameOfPath(input);

          return await attemptInstall({ fileName, dataP: promise }, disposer);
        }

        try {
          await InputValidators.isPath.validate(input);

          // install from system path
          const fileName = getBasenameOfPath(input);

          return await attemptInstall({ fileName, dataP: readFileNotify(input) });
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
