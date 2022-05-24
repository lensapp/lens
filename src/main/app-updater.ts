/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { UpdateInfo } from "electron-updater";
import { autoUpdater } from "electron-updater";
import logger from "./logger";
import { isPublishConfigured, isTestEnv } from "../common/vars";
import { delay } from "../common/utils";
import type { UpdateAvailableToBackchannel } from "../common/ipc";
import { areArgsUpdateAvailableToBackchannel, AutoUpdateChecking, AutoUpdateLogPrefix, AutoUpdateNoUpdateAvailable, broadcastMessage, onceCorrect, UpdateAvailableChannel } from "../common/ipc";
import { once } from "lodash";
import { ipcMain } from "electron";
import { nextUpdateChannel } from "./utils/update-channel";
import { UserStore } from "../common/user-store";

let installVersion: undefined | string;

export function isAutoUpdateEnabled() {
  return autoUpdater.isUpdaterActive() && isPublishConfigured;
}

function handleAutoUpdateBackChannel(event: Electron.IpcMainEvent, ...[arg]: UpdateAvailableToBackchannel) {
  if (arg.doUpdate) {
    if (arg.now) {
      logger.info(`${AutoUpdateLogPrefix}: User chose to update now`);
      autoUpdater.quitAndInstall(true, true);
    } else {
      logger.info(`${AutoUpdateLogPrefix}: User chose to update on quit`);
    }
  } else {
    logger.info(`${AutoUpdateLogPrefix}: User chose not to update, will update on quit anyway`);
  }
}

autoUpdater.logger = {
  info: message => logger.info(`[AUTO-UPDATE]: electron-updater: %s`, message),
  warn: message => logger.warn(`[AUTO-UPDATE]: electron-updater: %s`, message),
  error: message => logger.error(`[AUTO-UPDATE]: electron-updater: %s`, message),
  debug: message => logger.debug(`[AUTO-UPDATE]: electron-updater: %s`, message),
};

interface Dependencies {
  isAutoUpdateEnabled: () => boolean;
}

/**
 * starts the automatic update checking
 * @param interval milliseconds between interval to check on, defaults to 2h
 */
export const startUpdateChecking = ({ isAutoUpdateEnabled } : Dependencies) => once(function (interval = 1000 * 60 * 60 * 2): void {
  if (!isAutoUpdateEnabled() || isTestEnv) {
    return;
  }

  const userStore = UserStore.getInstance();

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.channel = userStore.updateChannel;
  autoUpdater.allowDowngrade = userStore.isAllowedToDowngrade;

  autoUpdater
    .on("update-available", (info: UpdateInfo) => {
      if (installVersion === info.version) {
        // same version, don't broadcast
        return;
      }

      installVersion = info.version;

      autoUpdater.downloadUpdate()
        .catch(error => logger.error(`${AutoUpdateLogPrefix}: failed to download update`, { error: String(error) }));
    })
    .on("update-downloaded", (info: UpdateInfo) => {
      try {
        const backchannel = `auto-update:${info.version}`;

        ipcMain.removeAllListeners(backchannel); // only one handler should be present

        // make sure that the handler is in place before broadcasting (prevent race-condition)
        onceCorrect({
          source: ipcMain,
          channel: backchannel,
          listener: handleAutoUpdateBackChannel,
          verifier: areArgsUpdateAvailableToBackchannel,
        });
        logger.info(`${AutoUpdateLogPrefix}: broadcasting update available`, { backchannel, version: info.version });
        broadcastMessage(UpdateAvailableChannel, backchannel, info);
      } catch (error) {
        logger.error(`${AutoUpdateLogPrefix}: broadcasting failed`, { error });
        installVersion = undefined;
      }
    })
    .on("update-not-available", () => {
      const nextChannel = nextUpdateChannel(userStore.updateChannel, autoUpdater.channel);

      logger.info(`${AutoUpdateLogPrefix}: update not available from ${autoUpdater.channel}, will check ${nextChannel} channel next`);

      if (nextChannel !== autoUpdater.channel) {
        autoUpdater.channel = nextChannel;
        autoUpdater.checkForUpdates()
          .catch(error => logger.error(`${AutoUpdateLogPrefix}: failed with an error`, error));
      } else {
        broadcastMessage(AutoUpdateNoUpdateAvailable);
      }
    });

  async function helper() {
    while (true) {
      await checkForUpdates();
      await delay(interval);
    }
  }

  helper();
});

export async function checkForUpdates(): Promise<void> {
  const userStore = UserStore.getInstance();

  try {
    logger.info(`📡 Checking for app updates`);

    autoUpdater.channel = userStore.updateChannel;
    autoUpdater.allowDowngrade = userStore.isAllowedToDowngrade;
    broadcastMessage(AutoUpdateChecking);
    await autoUpdater.checkForUpdates();
  } catch (error) {
    logger.error(`${AutoUpdateLogPrefix}: failed with an error`, error);
  }
}
