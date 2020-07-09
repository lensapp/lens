import { autoUpdater, UpdateCheckResult } from "electron-updater";
import logger from "./logger";

export default class AppUpdater {

  protected updateInterval: number = (1000 * 60 * 60 * 24) // once a day

  constructor() {
    autoUpdater.logger = logger;
  }

  public async start(): Promise<UpdateCheckResult> {
    setInterval(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, this.updateInterval);

    return autoUpdater.checkForUpdatesAndNotify();
  }
}
