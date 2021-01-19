import { autoUpdater, UpdateInfo } from "electron-updater";
import logger from "./logger";
import { IpcChannel, NotificationChannelAdd, NotificationChannelPrefix } from "../common/ipc";
import { ipcMain } from "electron";
import { isDevelopment, isTestEnv } from "../common/vars";
import { SemVer } from "semver";
import moment from "moment";
import { WindowManager } from "./window-manager"
import { delay } from "../common/utils";

class NotificationBackchannel {
  private static _id = 0;

  static nextId(): IpcChannel {
    return `${NotificationChannelPrefix}${NotificationBackchannel._id++}`
  }
}

const title = "Lens Updater";

async function autoUpdateCheck(windowManager: WindowManager, args: UpdateInfo): Promise<void> {
  return new Promise(async resolve => {
    const body = `Version ${args.version} of Lens IDE is now available. Would you like to update?`;
    const yesNowChannel = NotificationBackchannel.nextId();
    const yesLaterChannel = NotificationBackchannel.nextId();
    const noChannel = NotificationBackchannel.nextId();

    function cleanupChannels() {
      ipcMain.removeAllListeners(yesNowChannel);
      ipcMain.removeAllListeners(yesLaterChannel);
      ipcMain.removeAllListeners(noChannel);
    }

    ipcMain
      .on(yesNowChannel, async () => {
        logger.info("[UPDATE CHECKER]: User chose to update immediately");
        cleanupChannels();

        await autoUpdater.downloadUpdate();
        autoUpdater.quitAndInstall();

        resolve();
      })
      .on(yesLaterChannel, async () => {
        logger.info("[UPDATE CHECKER]: User chose to update on quit");
        cleanupChannels();

        await autoUpdater.downloadUpdate();
        autoUpdater.autoInstallOnAppQuit = true;

        resolve();
      })
      .on(noChannel, () => {
        logger.info("[UPDATE CHECKER]: User chose not to update");
        cleanupChannels();
        resolve();
      });

    windowManager.mainView.webContents.send(NotificationChannelAdd, {
      title,
      body,
      status: "info",
      buttons: [
        {
          label: "Yes, now",
          backchannel: yesNowChannel,
          className: "light"
        },
        {
          label: "Yes, on quit",
          backchannel: yesLaterChannel,
          className: "primary outline"
        },
        {
          label: "Remind later",
          backchannel: noChannel,
          className: "primary outline"
        }
      ],
      closeChannel: noChannel,
    });
  });
}

/**
 * starts the automatic update checking
 * @param interval milliseconds between interval to check on, defaults to 24h
 */
export function startUpdateChecking(windowManager: WindowManager, interval = 1000 * 60 * 60 * 24): void {
  if (isDevelopment || isTestEnv) {
    return;
  }

  autoUpdater.logger = logger;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater
    .on("update-available", async (args: UpdateInfo) => {
      try {
        await autoUpdateCheck(windowManager, args);
      } catch (error) {
        logger.error("[UPDATE CHECKER]: notification failed", { error: String(error) })
      }
    })

  async function helper() {
    while (true) {
      await autoUpdater.checkForUpdates()
        .catch(error => logger.error("[UPDATE CHECKER]: failed with an error", { error: String(error) }));
      await delay(interval);
    }
  }

  helper();
}
