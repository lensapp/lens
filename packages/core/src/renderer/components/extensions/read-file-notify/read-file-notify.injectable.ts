/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getMessageFromError } from "../get-message-from-error/get-message-from-error";
import { getInjectable } from "@ogre-tools/injectable";
import { showErrorNotificationInjectable } from "@k8slens/notifications";
import { loggerInjectionToken } from "@k8slens/logger";
import readFileBufferInjectable from "../../../../common/fs/read-file-buffer.injectable";

export type ReadFileNotify = (filePath: string, showError?: boolean) => Promise<Buffer | null>;

const readFileNotifyInjectable = getInjectable({
  id: "read-file-notify",
  instantiate: (di): ReadFileNotify => {
    const showErrorNotification = di.inject(showErrorNotificationInjectable);
    const logger = di.inject(loggerInjectionToken);
    const readFileBuffer = di.inject(readFileBufferInjectable);

    return async (filePath, showError = true) => {
      try {
        return await readFileBuffer(filePath);
      } catch (error) {
        if (showError) {
          const message = getMessageFromError(error);

          logger.info(`[EXTENSION-INSTALL]: preloading ${filePath} has failed: ${message}`, { error });
          showErrorNotification(`Error while reading "${filePath}": ${message}`);
        }
      }

      return null;
    };
  },
});

export default readFileNotifyInjectable;

