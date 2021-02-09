import { autoUpdater, UpdateInfo } from "electron-updater";
import logger from "./logger";
import { isDevelopment, isTestEnv } from "../common/vars";
import { delay } from "../common/utils";
import { areArgsUpdateAvailableToBackchannel, AutoUpdateLogPrefix, broadcastMessage, onceCorrect, UpdateAvailableChannel, UpdateAvailableToBackchannel } from "../common/ipc";
import { ipcMain } from "electron";

function handleAutoUpdateBackChannel(event: Electron.IpcMainEvent, ...[arg]: UpdateAvailableToBackchannel) {
  if (arg.doUpdate) {
    if (arg.now) {
      logger.info(`${AutoUpdateLogPrefix}: User chose to update now`);
      autoUpdater.downloadUpdate()
        .then(() => autoUpdater.quitAndInstall())
        .catch(error => logger.error(`${AutoUpdateLogPrefix}: Failed to download or install update`, { error }));
    } else {
      logger.info(`${AutoUpdateLogPrefix}: User chose to update on quit`);
      autoUpdater.autoInstallOnAppQuit = true;
      autoUpdater.downloadUpdate()
        .catch(error => logger.error(`${AutoUpdateLogPrefix}: Failed to download update`, { error }));
    }
  } else {
    logger.info(`${AutoUpdateLogPrefix}: User chose not to update`);
  }
}

/**
 * starts the automatic update checking
 * @param interval milliseconds between interval to check on, defaults to 24h
 */
export function startUpdateChecking(interval = 1000 * 60 * 60 * 24): void {
  if (isDevelopment || isTestEnv) {
    return;
  }

  autoUpdater.logger = logger;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater
    .on("update-available", (args: UpdateInfo) => {
      try {
        const backchannel = `auto-update:${args.version}`;

        ipcMain.removeAllListeners(backchannel); // only one handler should be present

        // make sure that the handler is in place before broadcasting (prevent race-condition)
        onceCorrect({
          source: ipcMain,
          channel: backchannel,
          listener: handleAutoUpdateBackChannel,
          verifier: areArgsUpdateAvailableToBackchannel,
        });
        logger.info(`${AutoUpdateLogPrefix}: broadcasting update available`, { backchannel, version: args.version });
        broadcastMessage(UpdateAvailableChannel, backchannel, args);
      } catch (error) {
        logger.error(`${AutoUpdateLogPrefix}: broadcasting failed`, { error });
      }
    });

  async function helper() {
    while (true) {
      await checkForUpdates();
      await delay(interval);
    }
  }

  helper();
}

export async function checkForUpdates(): Promise<void> {
  try {
    logger.info(`📡 Checking for app updates`);

    await autoUpdater.checkForUpdates();
  } catch (error) {
    logger.error(`${AutoUpdateLogPrefix}: failed with an error`, { error: String(error) });
  }
}
