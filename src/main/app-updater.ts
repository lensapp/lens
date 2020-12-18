import { autoUpdater, UpdateInfo } from "electron-updater";
import { autorun } from "mobx";
import { userStore } from "../common/user-store";
import logger from "./logger";
import dateFormat from "dateformat";
import { broadcastIpc, IpcChannel, NotificationChannelAdd, NotificationChannelPrefix } from "../common/ipc";
import { ipcMain } from "electron";
import { isDevelopment } from "../common/vars";
import { SemVer } from "semver";

function delay(duration: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, duration));
}

class NotificationBackchannel {
  private static _id = 0;

  static nextId(): IpcChannel {
    return `${NotificationChannelPrefix}${NotificationBackchannel._id++}`
  }
}

const title = "Lens Updater";

async function autoUpdateNow(): Promise<void> {
  const body = "Downloading and installing update.";
  broadcastIpc({
    channel: NotificationChannelAdd,
    args: [{
      title,
      body,
      status: "info",
      timeout: 5000,
    }]
  })

  logger.info("[UPDATE CHECKER]: update downloaded started");
  await autoUpdater.downloadUpdate();
  logger.info("[UPDATE CHECKER]: update downloadeded");
  autoUpdater.quitAndInstall();
}

async function autoUpdateCheck(args: UpdateInfo): Promise<void> {
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

    broadcastIpc({
      channel: NotificationChannelAdd,
      args: [{
        title,
        body,
        status: "info",
        buttons: [
          {
            label: "Yes, now",
            backchannel: yesNowChannel,
            style: {
              background: "green",
              marginRight: "10px"
            }
          },
          {
            label: "Yes, later",
            backchannel: yesLaterChannel,
            style: {
              background: "green",
              marginRight: "10px"
            }
          },
          {
            label: "No",
            backchannel: noChannel,
            accent: true
          }
        ],
        closeChannel: noChannel,
      }]
    });
  });
}

/**
 * starts the automatic update checking
 * @param interval milliseconds between interval to check on, defaulkts to 24h
 */
export function startUpdateChecking(interval = 1000 * 60 * 60 * 24): void {
  if (isDevelopment) {
    return;
  }

  autoUpdater.logger = logger;
  autoUpdater.autoInstallOnAppQuit = false;

  /**
   * GC saftey: This function's lifetime is the lifetime of the application.
   *            So no need to call the disposer.
   */
  autorun(() => {
    autoUpdater.autoDownload = userStore.preferences.allowAutoUpdates;
    autoUpdater.allowPrerelease = userStore.preferences.allowPrereleaseVersions;
  });

  autoUpdater
    .on("update-available", async (args: UpdateInfo) => {
      try {
        const releaseDate = new Date(args.releaseDate);
        const body = `Version ${args.version} was release on ${dateFormat(releaseDate, "dddd, mmmm dS, yyyy")}.`;
        broadcastIpc({
          channel: NotificationChannelAdd,
          args: [{
            title,
            body,
            status: "info",
            timeout: 5000,
          }]
        });

        const version = new SemVer(args.version);

        if (userStore.preferences.allowAutoUpdates && version.prerelease !== null) {
          // don't auto update to pre-release versions.
          await autoUpdateNow();
        } else {
          await autoUpdateCheck(args);
        }
      } catch (error) {
        logger.error("[UPDATE CHECKER]: notification failed", { error: String(error) })
      }
    })
    .on("update-not-available", () => {
      try {
        const stream = userStore.preferences.allowPrereleaseVersions ? "prerelease" : "stable";
        const body = `Lens is running the latest ${stream} version.`;
        broadcastIpc({
          channel: NotificationChannelAdd,
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
      await autoUpdater.checkForUpdates();
      await delay(interval);
    }
  }

  helper()
    .catch(error => logger.error("[UPDATE CHECKER]: failed with an error", { error: String(error) }));
}
