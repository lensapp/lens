/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { autoUpdater, UpdateInfo } from "electron-updater";
import logger from "../logger";
import { isLinux, isMac, isPublishConfigured, isTestEnv } from "../../common/vars";
import { delay, bind } from "../../common/utils";
import { areArgsUpdateAvailableToBackchannel, AutoUpdateLogPrefix, AutoUpdateNoUpdateAvailable, broadcastMessage, onceCorrect, UpdateAvailableChannel, UpdateAvailableToBackchannel } from "../../common/ipc";
import { once } from "lodash";
import { ipcMain, autoUpdater as electronAutoUpdater } from "electron";
import { nextUpdateChannel } from "../utils/update-channel";
import type { UserPreferencesStore } from "../../common/user-preferences/store";

let installVersion: null | string = null;

export function isAutoUpdateEnabled() {
  return autoUpdater.isUpdaterActive() && isPublishConfigured;
}

function handleAutoUpdateBackChannel(event: Electron.IpcMainEvent, ...[arg]: UpdateAvailableToBackchannel) {
  if (arg.doUpdate) {
    if (arg.now) {
      logger.info(`${AutoUpdateLogPrefix}: User chose to update now`);
      setImmediate(() => {
        if (isMac) {
          /**
           * This is a necessary workaround until electron-updater is fixed.
           * The problem is that it downloads it but then never tries to
           * download it from itself via electron.
           */
          electronAutoUpdater.checkForUpdates();
        } else if (isLinux) {
          /**
           * This is a necessary workaround until electron-updater is fixed.
           * The problem is that because linux updating is not implemented at
           * all via electron. Electron's autoUpdater.quitAndInstall() is never
           * called.
           */
          electronAutoUpdater.emit("before-quit-for-update");
        }
        autoUpdater.quitAndInstall(true, true);
      });
    } else {
      logger.info(`${AutoUpdateLogPrefix}: User chose to update on quit`);
      autoUpdater.autoInstallOnAppQuit = true;
    }
  } else {
    logger.info(`${AutoUpdateLogPrefix}: User chose not to update`);
  }
}

autoUpdater.logger = {
  info: message => logger.info(`[AUTO-UPDATE]: electron-updater:`, message),
  warn: message => logger.warn(`[AUTO-UPDATE]: electron-updater:`, message),
  error: message => logger.error(`[AUTO-UPDATE]: electron-updater:`, message),
  debug: message => logger.debug(`[AUTO-UPDATE]: electron-updater:`, message),
};

interface Dependencies {
  userStore: UserPreferencesStore;
  checkForUpdates: () => Promise<void>;
}

/**
 * starts the automatic update checking
 * @param interval milliseconds between interval to check on, defaults to 24h
 */
const startUpdateChecking = once(function ({ userStore, checkForUpdates }: Dependencies, interval = 1000 * 60 * 60 * 24): void {
  if (!isAutoUpdateEnabled() || isTestEnv) {
    return;
  }

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.channel = userStore.updateChannel;
  autoUpdater.allowDowngrade = userStore.isAllowedToDowngrade;

  autoUpdater
    .on("update-available", (info: UpdateInfo) => {
      if (autoUpdater.autoInstallOnAppQuit) {
        // a previous auto-update loop was completed with YES+LATER, check if same version
        if (installVersion === info.version) {
          // same version, don't broadcast
          return;
        }
      }

      /**
       * This should be always set to false here because it is the reasonable
       * default. Namely, if a don't auto update to a version that the user
       * didn't ask for.
       */
      autoUpdater.autoInstallOnAppQuit = false;
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

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import checkForUpdatesInjectable from "./check-for-updates.injectable";
import userPreferencesStoreInjectable from "../../common/user-preferences/store.injectable";

const startUpdateCheckingInjectable = getInjectable({
  instantiate: (di) => bind(startUpdateChecking, null, {
    checkForUpdates: di.inject(checkForUpdatesInjectable),
    userStore: di.inject(userPreferencesStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default startUpdateCheckingInjectable;
