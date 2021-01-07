import { autoUpdater, UpdateInfo } from "electron-updater";
import logger from "./logger";
import { IpcChannel, NotificationChannelAdd, NotificationChannelPrefix } from "../common/ipc";
import { ipcMain } from "electron";
import { isDevelopment } from "../common/vars";
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

async function autoUpdateCheck(windowManager: WindowManager): Promise<void> {
  return new Promise(async resolve => {
    const body = "Install and restart Lens?";
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
        cleanupChannels();

        await autoUpdater.downloadUpdate();
        autoUpdater.quitAndInstall();

        resolve();
      })
      .on(yesLaterChannel, async () => {
        cleanupChannels();

        await autoUpdater.downloadUpdate();
        autoUpdater.autoInstallOnAppQuit = true;

        resolve();
      })
      .on(noChannel, () => {
        cleanupChannels();
        resolve();
      });

    windowManager.mainView.webContents.send(NotificationChannelAdd, {
      args: [{
        title,
        body,
        status: "info",
        buttons: [
          {
            label: "Yes, now",
            backchannel: yesNowChannel,
            action: true,
          },
          {
            label: "Yes, on quit",
            backchannel: yesLaterChannel,
            action: true,
          },
          {
            label: "No",
            backchannel: noChannel,
            secondary: true
          }
        ],
        closeChannel: noChannel,
      }]
    });
  });
}

/**
 * starts the automatic update checking
 * @param interval milliseconds between interval to check on, defaults to 24h
 */
export function startUpdateChecking(windowManager: WindowManager, interval = 1000 * 60 * 60 * 24): void {
  if (isDevelopment) {
    return;
  }

  autoUpdater.logger = logger;

  autoUpdater
    .on("update-available", async (args: UpdateInfo) => {
      try {
        const releaseDate = moment(args.releaseDate);
        const body = `Version ${args.version} was release on ${releaseDate.format("dddd, mmmm dS, yyyy")}.`;
        windowManager.mainView.webContents.send(NotificationChannelAdd, {
          args: [{
            title,
            body,
            status: "info",
            timeout: 5000,
          }]
        });

        await autoUpdateCheck(windowManager);
      } catch (error) {
        logger.error("[UPDATE CHECKER]: notification failed", { error: String(error) })
      }
    })
    .on("update-not-available", (args: UpdateInfo) => {
      try {
        const version = new SemVer(args.version);
        const stream = version.prerelease === null ? "stable" : "prerelease";
        const body = `Lens is running the latest ${stream} version.`;
        windowManager.mainView.webContents.send(NotificationChannelAdd, {
          args: [{
            title,
            body,
            status: "info",
            timeout: 5000,
          }]
        })
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
