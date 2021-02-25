import { autoUpdater, UpdateInfo } from "electron-updater";
import logger from "./logger";
import { isDevelopment, isTestEnv } from "../common/vars";
import { delay } from "../common/utils";
import { areArgsUpdateAvailableToBackchannel, AutoUpdateLogPrefix, broadcastMessage, onceCorrect, UpdateAvailableChannel, UpdateAvailableToBackchannel } from "../common/ipc";
import { ipcMain } from "electron";
import { once } from "lodash";

let installVersion: null | string = null;

function handleAutoUpdateBackChannel(event: Electron.IpcMainEvent, ...[arg]: UpdateAvailableToBackchannel) {
  if (arg.doUpdate) {
    if (arg.now) {
      logger.info(`${AutoUpdateLogPrefix}: User chose to update now`);
      autoUpdater.on("update-downloaded", () => autoUpdater.quitAndInstall());
      autoUpdater.downloadUpdate().catch(error => logger.error(`${AutoUpdateLogPrefix}: Failed to download or install update`, { error }));
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
export const startUpdateChecking = once(function (interval = 1000 * 60 * 60 * 24): void {
  if (isDevelopment || isTestEnv) {
    return;
  }

  autoUpdater.logger = logger;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater
    .on("update-available", (args: UpdateInfo) => {
      if (autoUpdater.autoInstallOnAppQuit) {
        // a previous auto-update loop was completed with YES+LATER, check if same version
        if (installVersion === args.version) {
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
      installVersion = args.version;

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
        installVersion = undefined;
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
  try {
    logger.info(`📡 Checking for app updates`);

    await autoUpdater.checkForUpdates();
  } catch (error) {
    logger.error(`${AutoUpdateLogPrefix}: failed with an error`, { error: String(error) });
  }
}
