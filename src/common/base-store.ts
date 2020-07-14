import path from "path"
import Config from "conf"
import { Options as ConfOptions } from "conf/dist/source/types"
import produce from "immer";
import { app, ipcMain, ipcRenderer, remote } from "electron"
import { action, observable, reaction, toJS, when } from "mobx";
import Singleton from "./utils/singleton";
import isEqual from "lodash/isEqual"
import { getAppVersion } from "./utils/app-version";
import logger from "../main/logger";
import { broadcastMessage } from "./ipc-helpers";

export interface BaseStoreParams<T = any> extends ConfOptions<T> {
  autoLoad?: boolean;
  syncEnabled?: boolean;
}

export class BaseStore<T = any> extends Singleton {
  protected storeConfig: Config<T>;
  protected syncDisposers: Function[] = [];

  whenLoaded = when(() => this.isLoaded);
  @observable isLoaded = false;
  @observable protected data: T;

  protected constructor(protected params: BaseStoreParams) {
    super();
    this.params = {
      autoLoad: false,
      syncEnabled: true,
      ...params,
    }
    this.init();
  }

  get name() {
    return path.basename(this.storeConfig.path);
  }

  get syncEvent() {
    return `[STORE]:[SYNC]:${this.name}`
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
      get cwd() {
        return (app || remote.app).getPath("userData");
      },
    });
    const storeModel = Object.assign({}, this.storeConfig.store);
    Reflect.deleteProperty(storeModel, "__internal__"); // fixme: avoid "external-internals"
    logger.info(`[STORE]: loaded ${this.storeConfig.path}`);
    this.fromStore(storeModel);
    this.isLoaded = true;
  }

  enableSync() {
    this.syncDisposers.push(
      reaction(() => this.toJSON(), this.onModelChange.bind(this)),
    );
    if (ipcMain) {
      ipcMain.on(this.syncEvent, (event, model: T) => {
        logger.info(`[STORE]: ${this.name} sync update from renderer`, model);
        this.onSync(model);
      });
      this.syncDisposers.push(() => ipcMain.removeAllListeners(this.syncEvent));
    }
    if (ipcRenderer) {
      ipcRenderer.on(this.syncEvent, (event, model: T) => {
        logger.info(`[STORE]: ${this.name} sync update from main`, model);
        this.onSync(model);
      });
      this.syncDisposers.push(() => ipcRenderer.removeAllListeners(this.syncEvent));
    }
  }

  disableSync() {
    this.syncDisposers.forEach(dispose => dispose());
    this.syncDisposers.length = 0;
  }

  protected onSync(model: T) {
    if (!isEqual(this.toJSON(), model)) {
      logger.info(`[STORE]: ${this.name} received update from main`, model);
      this.fromStore(model);
    }
  }

  protected async onModelChange(model: T) {
    // update views and save to config file
    if (ipcMain) {
      broadcastMessage(this.syncEvent, model);
      // fixme: https://github.com/sindresorhus/conf/issues/114
      Object.entries(model).forEach(([key, value]) => {
        this.storeConfig.set(key, value);
      });
    }
    // sends "update-request" event to main-process
    if (ipcRenderer) {
      ipcRenderer.send(this.syncEvent, model);
    }
  }

  @action
  protected fromStore(data: T) {
    this.data = data;
  }

  @action
  merge(updater: (modelDraft: T) => void) {
    this.data = produce(this.data, updater);
  }

  // todo: use "serializr" ?
  toJSON(): T {
    return toJS(this.data, {
      recurseEverything: true,
    })
  }

  * [Symbol.iterator]() {
    yield* Object.entries(this.toJSON());
  }
}
