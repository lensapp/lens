import path from "path"
import Config from "conf"
import { Options as ConfOptions } from "conf/dist/source/types"
import { app, remote } from "electron"
import { observable, reaction, toJS, when } from "mobx";
import Singleton from "./utils/singleton";
import isEqual from "lodash/isEqual"
import { getAppVersion } from "./utils/app-version";

export interface BaseStoreParams<T = any> {
  configName: string;
  autoLoad?: boolean;
  syncEnabled?: boolean;
  confOptions?: ConfOptions<T>;
}

export class BaseStore<T = any> extends Singleton {
  protected storeConfig: Config<T>;
  protected syncDisposers: Function[] = [];
  public whenLoaded = when(() => this.isLoaded);

  @observable isLoaded = false;
  @observable protected data: T;

  protected constructor(protected params: BaseStoreParams) {
    super();
    this.params = {
      autoLoad: true,
      syncEnabled: true,
      ...params,
    }
    this.onConfigChange = this.onConfigChange.bind(this)
    this.onModelChange = this.onModelChange.bind(this)
    this.init();
  }

  get name() {
    return path.basename(this.storeConfig.path);
  }

  get storeModel(): T {
    const storeModel = { ...(this.storeConfig.store || {}) };
    Reflect.deleteProperty(storeModel, "__internal__"); // fixme: avoid "external-internals"
    return storeModel as T;
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

  protected async load() {
    const { configName, syncEnabled, confOptions = {} } = this.params;

    // use "await" to make pseudo-async "load" for more future-proof usages
    this.storeConfig = await new Config({
      projectName: "lens",
      projectVersion: getAppVersion(),
      configName: configName,
      watch: syncEnabled, // watch for changes in multi-process app (e.g. main/renderer)
      cwd: (app || remote.app).getPath("userData"), // todo: remove remote.app in favor ipc.invoke
      ...confOptions,
    });
    const data = this.storeConfig.store;
    console.info(`[STORE]: [LOADED] ${this.storeConfig.path}`, data);
    this.fromStore(data);
    this.isLoaded = true;
  }

  enableSync() {
    const onConfigChangeStop = this.storeConfig.onDidAnyChange(this.onConfigChange);
    const onModelChangeStop = reaction(() => this.toJSON(), this.onModelChange);

    this.syncDisposers.push(
      onConfigChangeStop, // watch for changes from file-system updates
      onModelChangeStop, // refresh config file from runtime
    );
  }

  disableSync() {
    this.syncDisposers.forEach(dispose => dispose());
    this.syncDisposers.length = 0;
  }

  protected onConfigChange(data: T, oldValue: Partial<T>) {
    if (!isEqual(this.toJSON(), data)) {
      console.info(`[STORE]: [UPDATE] from ${this.name}`, { data, oldValue });
      this.fromStore(data);
    }
  }

  protected onModelChange(model: T) {
    if (!isEqual(this.storeModel, model)) {
      console.info(`[STORE]: [SAVE] ${this.name} from runtime update`, {
        data: model,
        oldValue: this.storeModel
      });
      // fixme: https://github.com/sindresorhus/conf/issues/114
      Object.entries(model).forEach(([key, value]) => {
        this.storeConfig.set(key, value);
      });
    }
  }

  // todo: use "serializr" ?
  protected fromStore(data: Partial<T> = {}) {
    this.data = data as T;
  }

  toJSON(): T {
    return toJS(this.data, {
      recurseEverything: true,
    })
  }

  * [Symbol.iterator]() {
    yield* Object.entries(this.toJSON());
  }
}
