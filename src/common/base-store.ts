import path from "path";
import Config from "conf";
import { Options as ConfOptions } from "conf/dist/source/types";
import { app, ipcMain, IpcMainEvent, ipcRenderer, IpcRendererEvent, remote } from "electron";
import { IReactionOptions, observable, reaction, runInAction, when } from "mobx";
import Singleton from "./utils/singleton";
import { getAppVersion } from "./utils/app-version";
import logger from "../main/logger";
import { broadcastMessage, subscribeToBroadcast, unsubscribeFromBroadcast } from "./ipc";
import isEqual from "lodash/isEqual";

export interface BaseStoreParams<T = any> extends ConfOptions<T> {
  autoLoad?: boolean;
  syncEnabled?: boolean;
  syncOptions?: IReactionOptions;
}

/**
 * Note: T should only contain base JSON serializable types.
 */
export abstract class BaseStore<T = any> extends Singleton {
  protected storeConfig?: Config<T>;
  protected syncDisposers: Function[] = [];

  whenLoaded = when(() => this.isLoaded);
  @observable isLoaded = false;

  protected constructor(protected params: BaseStoreParams) {
    super();
    this.params = {
      autoLoad: false,
      syncEnabled: true,
      ...params,
    };
    this.init();
  }

  get name() {
    return path.basename(this.path);
  }

  protected get syncRendererChannel() {
    return `store-sync-renderer:${this.path}`;
  }

  protected get syncMainChannel() {
    return `store-sync-main:${this.path}`;
  }

  get path() {
    return this.storeConfig?.path || "";
  }

  protected async init() {
    if (this.params.autoLoad) {
      await this.load();
    }

    if (this.params.syncEnabled) {
      await this.whenLoaded;
      this.enableSync();
    }
  }

  async load() {
    const { autoLoad, syncEnabled, ...confOptions } = this.params;

    this.storeConfig = new Config({
      ...confOptions,
      projectName: "lens",
      projectVersion: getAppVersion(),
      cwd: this.cwd(),
    });
    logger.info(`[STORE]: LOADED from ${this.path}`);
    this.fromStore(this.storeConfig.store);
    this.isLoaded = true;
  }

  protected cwd() {
    return (app || remote.app).getPath("userData");
  }

  protected async saveToFile(model: T) {
    logger.info(`[STORE]: SAVING ${this.path}`);

    // todo: update when fixed https://github.com/sindresorhus/conf/issues/114
    if (this.storeConfig) {
      for (const [key, value] of Object.entries(model)) {
        this.storeConfig.set(key, value);
      }
    }
  }

  enableSync() {
    this.syncDisposers.push(
      reaction(() => this.toJSON(), model => this.onModelChange(model), this.params.syncOptions),
    );

    if (ipcMain) {
      const callback = (event: IpcMainEvent, model: T) => {
        logger.silly(`[STORE]: SYNC ${this.name} from renderer`, { model });
        this.onSync(model);
      };

      subscribeToBroadcast(this.syncMainChannel, callback);
      this.syncDisposers.push(() => unsubscribeFromBroadcast(this.syncMainChannel, callback));
    }

    if (ipcRenderer) {
      const callback = (event: IpcRendererEvent, model: T) => {
        logger.silly(`[STORE]: SYNC ${this.name} from main`, { model });
        this.onSyncFromMain(model);
      };

      subscribeToBroadcast(this.syncRendererChannel, callback);
      this.syncDisposers.push(() => unsubscribeFromBroadcast(this.syncRendererChannel, callback));
    }
  }

  protected onSyncFromMain(model: T) {
    this.applyWithoutSync(() => {
      this.onSync(model);
    });
  }

  unregisterIpcListener() {
    ipcRenderer?.removeAllListeners(this.syncMainChannel);
    ipcRenderer?.removeAllListeners(this.syncRendererChannel);
  }

  disableSync() {
    this.syncDisposers.forEach(dispose => dispose());
    this.syncDisposers.length = 0;
  }

  protected applyWithoutSync(callback: () => void) {
    this.disableSync();
    runInAction(callback);

    if (this.params.syncEnabled) {
      this.enableSync();
    }
  }

  protected onSync(model: T) {
    // todo: use "resourceVersion" if merge required (to avoid equality checks => better performance)
    if (!isEqual(this.toJSON(), model)) {
      this.fromStore(model);
    }
  }

  protected async onModelChange(model: T) {
    if (ipcMain) {
      this.saveToFile(model); // save config file
      broadcastMessage(this.syncRendererChannel, model);
    } else {
      broadcastMessage(this.syncMainChannel, model);
    }
  }

  /**
   * fromStore is called internally when a child class syncs with the file
   * system.
   * @param data the parsed information read from the stored JSON file
   */
  protected abstract fromStore(data: T): void;

  /**
   * toJSON is called when syncing the store to the filesystem. It should
   * produce a JSON serializable object representation of the current state.
   *
   * It is recommended that a round trip is valid. Namely, calling
   * `this.fromStore(this.toJSON())` shouldn't change the state.
   */
  abstract toJSON(): T;
}
