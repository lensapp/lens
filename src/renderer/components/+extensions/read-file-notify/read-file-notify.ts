/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import fse from "fs-extra";
import { getMessageFromError } from "../get-message-from-error/get-message-from-error";
import logger from "../../../../main/logger";
import { Notifications } from "../../notifications";

export const readFileNotify = async (filePath: string, showError = true): Promise<Buffer | null> => {
  try {
    return await fse.readFile(filePath);
  } catch (error) {
    if (showError) {
      const message = getMessageFromError(error);

      logger.info(`[EXTENSION-INSTALL]: preloading ${filePath} has failed: ${message}`, { error });
      Notifications.error(`Error while reading "${filePath}": ${message}`);
    }
  }

  return null;
};
