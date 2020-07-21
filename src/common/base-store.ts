import path from "path"
import Config from "conf"
import { Options as ConfOptions } from "conf/dist/source/types"
import { app, ipcMain, ipcRenderer, remote } from "electron"
import { action, observable, reaction, runInAction, toJS, when } from "mobx";
import Singleton from "./utils/singleton";
import { getAppVersion } from "./utils/app-version";
import logger from "../main/logger";
import { broadcastIpc } from "./ipc";
import isEqual from "lodash/isEqual";

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

  get syncChannel() {
    return `store-sync:${this.name}`
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
        return (app || remote.app).getPath("userData"); // todo: remove usage of remote.app (deprecated)
      },
    });
    const storedModel = Object.assign({}, this.storeConfig.store);
    Reflect.deleteProperty(storedModel, "__internal__"); // todo: avoid "external-internals"
    logger.info(`[STORE]: LOADED from ${this.storeConfig.path}`);
    this.fromStore(storedModel);
    this.isLoaded = true;
  }

  protected async save(model: T) {
    logger.info(`[STORE]: SAVING ${this.name}`);
    // todo: update when fixed https://github.com/sindresorhus/conf/issues/114
    Object.entries(model).forEach(([key, value]) => {
      this.storeConfig.set(key, value);
    });
  }

  enableSync() {
    this.syncDisposers.push(
      reaction(() => this.toJSON(), model => this.onModelChange(model)),
    );
    if (ipcMain) {
      ipcMain.on(this.syncChannel, (event, model: T) => {
        logger.debug(`[STORE]: SYNC ${this.name} from renderer`, { model });
        this.onSync(model);
      });
      this.syncDisposers.push(() => ipcMain.removeAllListeners(this.syncChannel));
    }
    if (ipcRenderer) {
      ipcRenderer.on(this.syncChannel, (event, model: T) => {
        logger.debug(`[STORE]: SYNC ${this.name} from main`, { model });
        this.onSync(model);
      });
      this.syncDisposers.push(() => ipcRenderer.removeAllListeners(this.syncChannel));
    }
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
    if (!isEqual(this.toJSON(), model)) {
      this.fromStore(model);
    }
  }

  protected async onModelChange(model: T) {
    if (ipcMain) {
      this.save(model); // save config file
      broadcastIpc({ channel: this.syncChannel, args: [model] }); // broadcast to renderer views
    }
    // send "update-request" to main-process
    if (ipcRenderer) {
      ipcRenderer.send(this.syncChannel, model);
    }
  }

  @action
  protected fromStore(data: T) {
    this.data = data;
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
