import path from "path";
import Config from "conf";
import { Options as ConfOptions } from "conf/dist/source/types";
import { app, ipcMain, IpcMainEvent, ipcRenderer, IpcRendererEvent, remote } from "electron";
import { IReactionOptions, observable, reaction, when } from "mobx";
import Singleton from "./utils/singleton";
import { getAppVersion } from "./utils/app-version";
import logger from "../main/logger";
import { createTypedSender } from "./ipc";
import isEqual from "lodash/isEqual";
import { autobind } from "./utils";

export interface BaseStoreParams<T = any> extends ConfOptions<T> {
  autoLoad?: boolean;
  syncEnabled?: boolean;
  syncOptions?: IReactionOptions;
}

/**
 * Note: T should only contain base JSON serializable types.
 */
export abstract class BaseStore<T = any> extends Singleton {
  protected storeConfig: Config<T>;
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
    return path.basename(this.storeConfig.path);
  }

  protected readonly syncRenderer = createTypedSender({
    channel: `store-sync-renderer:${this.path}`,
    verifier: (src: unknown): src is any => true,
  });

  protected readonly syncMain = createTypedSender({
    channel: `store-sync-main:${this.path}`,
    verifier: (src: unknown): src is any => true,
  });

  get path() {
    return this.storeConfig.path;
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
    Object.entries(model).forEach(([key, value]) => {
      this.storeConfig.set(key, value);
    });
  }

  enableSync() {
    this.syncDisposers.push(
      reaction(() => this.toJSON(), this.onModelChange, this.params.syncOptions),
    );

    if (ipcMain) {
      this.syncDisposers.push(this.syncMain.on((event: IpcMainEvent, model: T) => {
        logger.silly(`[STORE]: SYNC ${this.name} from renderer`, { model });
        this.onSync(model);
      }));
    }

    if (ipcRenderer) {
      this.syncDisposers.push(this.syncRenderer.on((event: IpcRendererEvent, model: T) => {
        logger.silly(`[STORE]: SYNC ${this.name} from main`, { model });
        this.disableSync();
        this.onSync(model);

        if (this.params.syncEnabled) {
          this.enableSync();
        }
      }));
    }
  }

  disableSync() {
    this.syncDisposers.forEach(dispose => dispose());
    this.syncDisposers.length = 0;
  }

  protected onSync(model: T) {
    // todo: use "resourceVersion" if merge required (to avoid equality checks => better performance)
    if (!isEqual(this.toJSON(), model)) {
      this.fromStore(model);
    }
  }

  @autobind()
  protected async onModelChange(model: T) {
    if (ipcMain) {
      this.saveToFile(model); // save config file
      this.syncRenderer.broadcast(model);
    } else {
      this.syncMain.broadcast(model);
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
   * produce a JSON serializable object representaion of the current state.
   *
   * It is recommended that a round trip is valid. Namely, calling
   * `this.fromStore(this.toJSON())` shouldn't change the state.
   */
  abstract toJSON(): T;
}
